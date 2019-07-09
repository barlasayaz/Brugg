<?php
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

require_once 'database_details.php';
require_once 'unirest-php/src/Unirest.php';
Unirest\Request::verifyPeer(false); 

// handle post objects
if ( $_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST)) {
    $_POST = (array) json_decode(file_get_contents('php://input'), true);
}

// From here on out means the user has successfully authenticated. 
// Now we can follow restfull api approach
// switch on the current http method, 
switch ($_SERVER['REQUEST_METHOD']) {
    case "POST":
        processing(  );
        die;
    case "PUT":
    case "GET":
    case "DELETE":
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error: 0';
        echo json_encode($error);
        die;
    case "OPTIONS":
        http_response_code(200);
        $ok = new \stdClass();
        $ok->opt = 1;
        echo json_encode($ok);
        die;
}

function processing() {
    global $brugg_id_api,$database_location,$database_username,$database_password,$database_name;
    $con_pvs4=mysqli_connect($database_location,$database_username,$database_password,$database_name);
    $con_pvs3=mysqli_connect('db2412.1und1.de','dbo322099820','1qay2wsx','db322099820');
    mysqli_query($con_pvs4,"SET NAMES 'utf8'");
    mysqli_query($con_pvs3,"SET NAMES 'utf8'");
    if (mysqli_connect_errno()){
        http_response_code(500);
        $error = new \stdClass();
        $error->message = "Failed to connect to MySQL: ".mysqli_connect_error();
        //$error->sql = $sql;
        $error->error = 5;
        echo json_encode($error);
        die;
    }

    // verify Brugg ID and token ------------------------
    $_POST['bruggid'] =  trim( mysqli_escape_string($con_pvs4,$_POST['bruggid']));
    $_POST['token']=   trim( mysqli_escape_string($con_pvs4,$_POST['token']));
    $url = $brugg_id_api.'resource.php?tick='.time();
    $data= array(
        'client_id' => "brugg-pvs",
        'client_secret' => 'b23c8hfqnvd3qt7865uiat',
        'username' => $_POST['bruggid'],
        'access_token' => $_POST['token']
    );

    $headers = array('Accept' => 'application/json');
    $body = Unirest\Request\Body::form($data); 
    $response = Unirest\Request::post($url, $headers, $body);

    if($response->code!=200){
        http_response_code($response->code);
        $error = new \stdClass();
        $error->message = 'not verified';
        $error->error = 5;
        $error->oauth2 = $response->body;
        echo json_encode($error);
        die;
    }
    // -------------------------------------------------
    // escape the uemailid to prevent sql injection
    $pvs3_id  = intval ( trim( mysqli_escape_string($con_pvs3,$_POST['pvs3_id']) ) );
    $list = array();
    $anz  = 0;

    $pvs3_obj= mysqli_query($con_pvs3,"SELECT * FROM kunden WHERE idKunde =$pvs3_id  ");
  
    if($pvs3_obj){             
        if(mysqli_num_rows($pvs3_obj) > 0){
            $row = mysqli_fetch_assoc($pvs3_obj);   
            $licensee = 1;
            $parent =0;
            $active =1;
            $customer_number = trim( $row['Kundennummer']);
            $company = trim( $row['Firma']);
            $street = trim( $row['Strasse']);
            $po_box = trim( $row['Postfach']);
            $zip_code = trim( $row['PLZ']);
            $place = trim( $row['Ort']);
            $country = trim( $row['Land']);
            $phone = trim( $row['Telefon']);
            $email = trim( $row['eMail']);
            $website = trim( $row['Website']);
            $sector = trim( $row['Branche']);
            $rating = trim( $row['Wertung']);
            /***************************************** Salse / Tester **********************************************************************************************/
            $sales = 0;
            $tester = 0;
            $vid = $row['Verantwortlicher_idAusendienster'];
            $ad  = mysqli_query($con_pvs3,"SELECT * FROM verantwortlicher WHERE idVerantwortliche = $vid; ");
            if($ad){
                if(mysqli_num_rows($ad) > 0){
                    $ad_x = mysqli_fetch_assoc($ad);  
                    $ad_email = trim(strtolower($ad_x['eMail']));
                    $k  = mysqli_query($con_pvs4,"SELECT * FROM profiles WHERE email LIKE '$ad_email'; ");
                    if($k){
                        if(mysqli_num_rows($k) > 0){
                            $k = mysqli_fetch_assoc($k);  
                            $sales = $k['id'];
                        }
                    }
                }
            }
            $vid = $row['Verantwortlicher_idPruefer'];
            $pr  = mysqli_query($con_pvs3,"SELECT * FROM verantwortlicher WHERE idVerantwortliche = $vid; ");
            if($pr){
                if(mysqli_num_rows($pr) > 0){
                    $pr_x = mysqli_fetch_assoc($pr);  
                    $pr_email =  trim(strtolower($pr_x['eMail']));
                    $k  = mysqli_query($con_pvs4,"SELECT * FROM profiles WHERE email LIKE '$pr_email'; ");
                    if($k){
                        if(mysqli_num_rows($k) > 0){
                            $k = mysqli_fetch_assoc($k); 
                            $tester = $k['id'];
                        }
                    }
                }
            }        
            /****************************************** sales_dates ********************************************************************/    
            $sales_dates = array(
                'last_id'        => 0,
                'last_date'      => "" ,
                'next_id'        => 0,
                'next_date'      => "" ,
            ); 
            $info = mysqli_query($con_pvs3, "SELECT * FROM kunden_info WHERE id=$pvs3_id;" );
            if($info){
                if(mysqli_num_rows($info) > 0){
                    $t = mysqli_fetch_assoc($info);
                    $sales_dates['last_date']  = $t['last_termin'];
                    $sales_dates['next_date']  = $t['next_termin'];
                }
            } 
            $sales_dates = json_encode( utf8encodeArray($sales_dates), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
            /****************************************** insert ************************************************************************** */
            $sql = "INSERT INTO `customer`( `pvs3_id`,`licensee`, `parent`,`active`, `customer_number`, `company`, `street`, `po_box`, `zip_code`, `place`, `country`, `phone`, `email`, `website`,  `sector`, `rating`,`sales`,`tester`,`sales_dates`)
                    VALUES ($pvs3_id,$licensee,$parent,$active,'$customer_number','$company','$street','$po_box','$zip_code','$place','$country','$phone','$email','$website','$sector','$rating',$sales, $tester, '$sales_dates');";
            $insert= mysqli_query($con_pvs4, $sql);
            if($insert){
                $pvs4_id = mysqli_insert_id($con_pvs4);
                $sql= "UPDATE `kunden` SET `pvs4_id`=$pvs4_id  WHERE idKunde =$pvs3_id ";
                $update= mysqli_query($con_pvs3, $sql);
                /***************************************** Products **********************************************************************************************/
                $pvs3_prod= mysqli_query($con_pvs3,"SELECT * FROM anschlagmittel WHERE Kunden_idKunde=$pvs3_id  AND aktiv=1 ORDER BY `IDNummer` ASC; ");
                if($pvs3_prod){             
                    while ($prod = mysqli_fetch_assoc($pvs3_prod)) {                                           
                        $licensee = 1;
                        $active   = 1;
                        $parent   = 0;
                        $customer = $pvs4_id;
                        $articel_no = $prod['ArtikelNr'];
                        $id_number  = $prod['IDNummer'];
                        $nfc_tag_id = $prod['NFC_UID'];
                        $qr_code = '';
                        $check_interval = intval($prod['Pruefintervall']);
                        $inspection_service = intval( $prod['Pruefservice']);    
                        $last_protocol = "";
                        $images =$prod['Bild'];
                        $t = utf8encodeArray ( array('de'=>$prod['EingabeObjekt'],'en'=>$prod['EingabeObjekt'],'it'=>$prod['EingabeObjekt'],'fr'=>$prod['EingabeObjekt']  ) );
                        $title = json_encode( $t , JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT );               
                        $items = array();
                        $i_1 = array('de'=>'Standort' ,'fr'=> 'Lieu' ,'it'=>'Sede' ,'en'=>'Location' );
                        $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Standort'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                        $items[] = $i_2;
                        $i_1 = array('de'=>'Notiz' ,'fr'=> 'Note' ,'it'=>'Notizia' ,'en'=>'Note' );
                        $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  str_replace(array("\r\n", "\r", "\n"), " ", $prod['Notiz'] ), 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                        $items[] = $i_2;                          
                        if($prod['PSA']==1){
                            $i_1 = array('de'=>'Marke' ,'fr'=> 'Marque' ,'it'=>'Marca' ,'en'=>'Brand' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['PSA_Marke'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Type' ,'fr'=> 'Type' ,'it'=>'Type' ,'en'=>'Type' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['PSA_Type'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Serie-Nr.' ,'fr'=> 'Nr. de série' ,'it'=>'serie nr.' ,'en'=>'Serial no.' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['PSA_SerieNr'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Baujahr' ,'fr'=> 'Année de construction' ,'it'=>'l`anno di costruzione' ,'en'=>'Year of manufacture' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['PSA_Baujahr'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                        }else if($prod['Seile']==1){
                            $i_1 = array('de'=>'Aufbau' ,'fr'=> 'Construction' ,'it'=>'Costruzione' ,'en'=>'Construction' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_Aufbau'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Auflagepunkte' ,'fr'=> 'Points de contact' ,'it'=>'punto di contatto' ,'en'=>'Supporting points' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_Auflagepunkt'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Soll/Ist' ,'fr'=> 'Valeur consigne/Valeur réelle' ,'it'=>'valore teorico/valore reale' ,'en'=>'Target/Actual' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_SollIst'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Nutzlänge NL in mm' ,'fr'=> 'Longueur utile mm' ,'it'=>'Lunghezza utile mm' ,'en'=>'Effective length LE in mm' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_Nutzlaenge'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Schlagart' ,'fr'=> 'Pas du câble' ,'it'=>'Tipo' ,'en'=>'Type of lay' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_Schlagart'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Anzahl tragender Drähte' ,'fr'=> 'Nombre de fils porteurs' ,'it'=>'Numero fili portanti' ,'en'=>'Number of load bearing wires' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Seile_TragDraehte'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                        }else if($prod['Spezialhebemittel']==1){
                            $i_1 = array('de'=>'Eigengewicht' ,'fr'=> 'Poids propre' ,'it'=>'Peso proprio' ,'en'=>'Dead weight' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Eigengewicht'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Traglast/Nutzlast' ,'fr'=> 'Charge utile' ,'it'=>'Carico utile ' ,'en'=>'Bearing load/effective load' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Traglast'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;   
                            $i_1 = array('de'=>'Baujahr' ,'fr'=> 'Année de construction' ,'it'=>'l`anno di costruzione' ,'en'=>'Year of manufacture' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Baujahr'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Norm' ,'fr'=> 'Norme' ,'it'=>'Norma' ,'en'=>'Standard' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Norm'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                        }else {
                            $i_1 = array('de'=>'Auflagepunkte' ,'fr'=> 'Points de contact' ,'it'=>'punto di contatto' ,'en'=>'Supporting points' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['EingabeEnden'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Hakenhersteller' ,'fr'=> 'Fabriquant' ,'it'=>'produttore di gancio' ,'en'=>'Hook manufacturer' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Hakenhersteller'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Vebindung' ,'fr'=> 'Liaison' ,'it'=>'Giunzione' ,'en'=>'Coupling' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['EingabeVerbindung'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Stränge' ,'fr'=> 'Brins' ,'it'=>'Bracci' ,'en'=>'Rope lines' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['EingabeAnzStraenge'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Grössen/ø in mm' ,'fr'=> 'Grandeur / ø en mm' ,'it'=>'Misure / ø in mm' ,'en'=>'Sizes in mm' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Groesse'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Nutzlänge NL in mm' ,'fr'=> 'Longueur utile mm' ,'it'=>'Lunghezza utile mm' ,'en'=>'Effective length LE in mm' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Nutzlaenge'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'WLL in t (0-45°)' ,'fr'=> 'WLL en t (0-45°)' ,'it'=>'WLL in t (0-45°)' ,'en'=>'WLL in t (0-45 °)' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Nutzlast'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                            $i_1 = array('de'=>'Zurrkapazität LC in to' ,'fr'=> 'Capacité d´arrimage LC en to' ,'it'=>'Carico di lavoro LC in t' ,'en'=>'Lashing capacity LC in to' );
                            $i_2 = array( 'type'=> 2, 'title' => $i_1, "value"=>  $prod['Kapazitaet'], 'id'=>0, 'user'=>0, 'licensee'=>0, 'options'=> array('max'=>200)  );
                            $items[] = $i_2;
                        }

                        $last_protocol = array(
                            'id'        => 0,
                            'protocol_date'      => "" ,
                            'protocol_date_next' => "" ,
                            "result" => 0
                        );                         
                        $info = mysqli_query($con_pvs3, "SELECT * FROM anschlagmittel_info WHERE id=".$prod['idAnschlagmittel'].";" );
                        if($info){
                            if(mysqli_num_rows($info) > 0){
                                $t = mysqli_fetch_array($info);
                                $x= $t['last_pr'];
                                if (strpos($x, '.') != false) {
                                    $st = explode('.',$x);
                                    $last_protocol['protocol_date'] = $st[2].'-'.$st[1].'-'.$st[0];
                                }
                                $x= $t['next_pr'];
                                if (strpos($x, '.') != false) {
                                    $st = explode('.',$x);
                                    $last_protocol['protocol_date_next'] = $st[2].'-'.$st[1].'-'.$st[0];                                    
                                }else if( strpos($x, 'reparieren') != false) {
                                    $last_protocol['result'] = 1;
                                }else if( strpos($x, 'unauffindbar') != false) {
                                    $last_protocol['result'] = 3;
                                }else if( strpos($x, 'ausmustern') != false) {
                                    $last_protocol['result'] = 4;
                                }
                            }  
                            }

                        $last_protocol = json_encode( $last_protocol , JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT );
                        $items = json_encode( $items , JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT );

                        $pvs3_prod_id = $prod['idAnschlagmittel'];

                        $sql = "INSERT INTO `products` (`pvs3_id`,`title`, `customer`, `id_number`, `parent`, `active`, `inspection_service`, `check_interval`, `last_protocol`, `articel_no`, `items`, `images`, `nfc_tag_id`, `qr_code`) 
                                VALUES ($pvs3_prod_id,'$title',$customer,'$id_number',$parent,$active,$inspection_service,$check_interval,'$last_protocol','$articel_no','$items','$images','$nfc_tag_id','$qr_code' );";
                                    
                        $insert= mysqli_query($con_pvs4, $sql);
                        $prod_id = mysqli_insert_id($con_pvs4);

                        $dir = '../../brugg2/attachments/prod_'.$prod['idAnschlagmittel'];
                        if(is_dir($dir)) {
                            $dateien = scandir($dir);  
                            if( $dateien ){
                                $nr = 1;
                                foreach( $dateien as $datei){
                                    if(is_file($dir.'/'.$datei)){
                                        $uploadPath = '../attachments/product_'.$prod_id;
                                        if(!is_dir($uploadPath))  mkdir($uploadPath);                                     
                                        copy($dir.'/'.$datei, $uploadPath .'/'.$datei);
                                    }
                                }
                            }
                        } 
                        //***********   protocols     ************** */
                        $sql = "SELECT * FROM pruefungen WHERE Anschlagmittel_idAnschlagmittel=".$prod['idAnschlagmittel']."  ORDER BY `pruefungen`.`Datum` DESC LIMIT 2 ;";
                        
                        $info = mysqli_query($con_pvs3, $sql );
                        if($info){
                            if(mysqli_num_rows($info) > 0){
                                while ($pruef = mysqli_fetch_assoc($info)) {
                                    $pruef = utf8encodeArray($pruef);
                                    $t = utf8encodeArray ( array('de'=>"PVS3 Protokoll",'en'=>"PVS3 Protocol",'it'=>"PVS3 Protocole",'fr'=>"PVS3 Protocole"  ) );
                                    $title = json_encode( $t , JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT );    
                                    $protocol_number = intval($pruef['Protokoll_Nr']);
                                    $product = '[{"id":"'.$prod_id.'","id_number":"'.$id_number.'"}]';
                                    $protocol_date = $pruef['Datum']." 08:00:00";
                                    $protocol_date_next = $pruef['DatumNext'];
                                    $result = intval($pruef['Entscheidung']);
                                    $pvs3_pruef_id =intval($pruef['idPruefungen']);
                                    $items = "[";  
                                 //   $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"ddddddd", "en":"eeeeee", "fr":"fffffff", "it": "iiiiiii"}, "options": { "max": 200  }, "active": "1", "value": "'.$pruef['xxxxxxxx'].'" } ';        
                                 //   $value = 'false'; if($pruef['xxxxx']) $value = 'true';
                                 //   $items.=',{ "type": "0", "mandatory": "false", "title": {"de":"ddddddd", "en":"eeeeee", "fr":"fffffff", "it": "iiiiiii"}, "options": { "default": true, "color": "#0fa0fa" }, "active": "1", "value": '.$value.' } ';                         
                                    $items.= '{ "type": "2", "mandatory": "false",  "title": {"de":"Standort", "en":"Location", "fr":"Lieu", "it": "Sede"}, "options": { "max": 200  },  "active": "1", "value": "'.$pruef['Standort'].'" } ';
                                    $items.=',{ "type": "2", "mandatory": "false",  "title": {"de":"Ansprechpartner", "en":"Point of contact", "fr":"Interlocuteur", "it": "Interlocutore"}, "options": { "max": 200  },  "active": "1", "value": "'.$pruef['AnsprechpartnerName'].'" } ';
                                    $items.=',{ "type": "2", "mandatory": "false",  "title": {"de":"Auftragsnr.", "en":"Order no.", "fr":"N° commande", "it": "Ordinazione n."}, "options": { "max": 200  },  "active": "1", "value": "'.$pruef['AuftragNrPr'].'" } ';   
                                    $items.=',{ "type": "2", "mandatory": "false",  "title": {"de":"Kundenbezeichnung", "en":"Customer designation", "fr":"Désignation client", "it": "Denominazione cliente"}, "options": { "max": 200  },  "active": "1", "value": "'.$pruef['KostenstellePr'].'" } '; 
                                    $items.=',{ "type": "2", "mandatory": "false",  "title": {"de":"Prüfer", "en":"Inspector", "fr":"Contrôleur", "it": "Controllore"}, "options": { "max": 200  },  "active": "1", "value": "'.$pruef['PrueferName'].'" } ';     
                                    $value = 'false'; if(intval($pruef['HandAuge'])) $value = 'true';
                                    $items.=',{ "type": "0", "mandatory": "false", "title": {"de":"Hand/Auge", "en":"Hand/eye", "fr":"Manuel/visuel", "it": "Manuale/visivo"}, "options": { "default": true, "color": "#0fa0fa" }, "active": "1", "value": '.$value.' } '; 
                                    $value = 'false'; if(intval($pruef['SchiebKettenlehre'])) $value = 'true';
                                    $items.=',{ "type": "0", "mandatory": "false", "title": {"de":"Schieb-/Kettenlehre", "en":"Caliper/chain gauge", "fr":"Calibre/jauge", "it": "Calibro / calibro a catena"}, "options": { "default": true, "color": "#0fa0fa" }, "active": "1", "value": '.$value.' } ';
                                    $value = 'false'; if(intval($pruef['UVGeraet'])) $value = 'true';
                                    $items.=',{ "type": "0", "mandatory": "false", "title": {"de":"UV-Rissprüfgerät", "en":"UV crack detection device", "fr":"Contrôle UV", "it": "Apparecchio di prova UV"}, "options": { "default": true, "color": "#0fa0fa" }, "active": "1", "value": '.$value.' } '; 
                                    $value = 'false'; if(intval($pruef['Zugmaschine'])) $value = 'true';
                                    $items.=',{ "type": "0", "mandatory": "false", "title": {"de":"Belastungsprobe", "en":"Load test", "fr":"Essai de charge", "it": "prova di carico"}, "options": { "default": true, "color": "#0fa0fa" }, "active": "1", "value": '.$value.' } ';    
                                    $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"Prüflast (kg)", "en":"Test load (kg)", "fr":"Charge de test (kg)", "it": "Carico di  prova (kg)"}, "options": { "max": 200  }, "active": "1", "value": "'.$pruef['Prueflast'].'" } ';   
                                    $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"Prüfmasse", "en":"Test measurements", "fr":"Mesure d essais", "it": "massa di prova"}, "options": { "max": 200  }, "active": "1", "value": "Soll: '.$pruef['PM_Soll_1'].'mm  Ist: '.$pruef['PM_Ist_1'].'mm" } ';
                                    $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"Prüfmasse", "en":"Test measurements", "fr":"Mesure d essais", "it": "massa di prova"}, "options": { "max": 200  }, "active": "1", "value": "Soll: '.$pruef['PM_Soll_2'].'mm  Ist: '.$pruef['PM_Ist_2'].'mm" } ';
                                    $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"Prüfmasse", "en":"Test measurements", "fr":"Mesure d essais", "it": "massa di prova"}, "options": { "max": 200  }, "active": "1", "value": "Soll: '.$pruef['PM_Soll_3'].'mm  Ist: '.$pruef['PM_Ist_3'].'mm" } ';
                                    $pruef['Bemerkung'] = str_replace(array("\r\n", "\r", "\n"), " ", $pruef['Bemerkung'] );
                                    $pruef['Bemerkung'] = str_replace(array( '\n'), " ", $pruef['Bemerkung'] );
                                    $pruef['Bemerkung'] = nl2br($pruef['Bemerkung']);
                                    $items.=',{ "type": "2", "mandatory": "false", "title": {"de":"Bemerkungen", "en":"Comments", "fr":"Remarques", "it": "Commenti"}, "options": { "max": 200  }, "active": "1", "value": "'.$pruef['Bemerkung'].'" } ';       
                                    $items.= "]"; 
                                    $sql = "INSERT INTO `protocols` (`pvs3_id`,`title`, `customer`, `product`,  `protocol_number`,  `active`, `items`, `protocol_date`, `protocol_date_next`, `result`) 
                                            VALUES            ($pvs3_pruef_id,'$title',$customer, '$product',  $protocol_number,  1      ,'$items','$protocol_date','$protocol_date_next',$result );";
                                                
                                    $insert= mysqli_query($con_pvs4, $sql);
                                    $pruef_id = mysqli_insert_id($con_pvs4);
//echo $sql."  <br> id:$pruef_id   ".intval($pruef['HandAuge']);
//break; //todo
                                }
                            }
                        }

                        $anz++;
//echo "  <br>   ";
//break; //todo
                    }
                } 
                //***************************************** Contact Persons **********************************************************************************************/
                $pvs3_contact= mysqli_query($con_pvs3,"SELECT * FROM ansprechpartner WHERE idKunde=$pvs3_id  AND Aktiv=1 ; ");
                if($pvs3_contact){             
                    while ($contact = mysqli_fetch_assoc($pvs3_contact)) {
                        $licensee = 1;
                        $active = 1;
                        $customer = $pvs4_id;
                        $pvs3_ansp_id = $contact['idAnsprechpartner'] ;
                        $last_name =  trim($contact['Name']);
                        $first_name = trim( $contact['Vorname']);
                        $street =  trim($contact['Strasse']);
                        $zip_code =  trim($contact['Ort']);
                        $department =  trim($contact['Abteilung']);
                        $email =  trim($contact['eMail']);
                        $phone = trim( $contact['Telefon']);
                        $mobile =  trim($contact['Mobiltelefon']);
                        $la_street = trim($contact['LA_Strasse']);
                        $la_zip = trim($contact['LA_Ort']);
                        $la_dep = trim($contact['LA_Abteilung']);
                        $adr = array();
                        $adr_1 = array("address_type"=> "Rechnungsadresse" ,"street" => $street, "zip_code" => $zip_code , "department" => $department, "email" => $email, "phone" => $phone, "mobile" => $mobile);
                        $adr[] = $adr_1;
                        if( (strlen($la_street)>0) && (strlen($la_zip)>0) &&(strlen($la_dep)>0) ){
                            $adr_1 = array( "address_type" => "Lieferadresse", "street" => $la_street, "zip_code" => $la_zip , "department" => $la_dep, "email" => "", "phone" => "", "mobile" => "");
                            $adr[] = $adr_1;
                        }
                        $addresses = json_encode( $adr , JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT );
                        $sql = "INSERT INTO `contact_persons`( `pvs3_id`, `email`, `active`, `first_name`, `last_name`, `customer`, `addresses`, `department`) 
                                                    VALUES ($pvs3_ansp_id, '$email', $active , '$first_name' , '$last_name' , $customer , '$addresses' , '$department' );";
                        $insert= mysqli_query($con_pvs4, $sql);
                    }
                } 
            }else{
                echo " - inser error - ".mysqli_error($con_pvs4)." - ".$sql;   
            }
            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = $anz;
            $ok->obj = $list ;
            echo json_encode($ok);
            mysqli_close($con_pvs4);
            die; 
        }else{
            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = 0;
            $ok->obj = '[]' ;
            echo json_encode($ok);
            mysqli_close($con_pvs4);
            die;        
        }
    }else{
        // return 500 problem with query.
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error 5';
        echo json_encode($error);
        die;
    }
}