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

global $brugg_id_api,$database_location,$database_username,$database_password,$database_name;
$con_pvs4=mysqli_connect($database_location,$database_username,$database_password,$database_name);

global $database_location_2,$database_username_2,$database_password_2,$database_name_2;
$con_pvs4_pr=mysqli_connect($database_location_2,$database_username_2,$database_password_2,$database_name_2);

$con_pvs3=mysqli_connect('db2412.1und1.de','dbo322099820','1qay2wsx','db322099820');

mysqli_query($con_pvs4,   "SET NAMES 'utf8'");
mysqli_query($con_pvs4_pr,"SET NAMES 'utf8'");
mysqli_query($con_pvs3,   "SET NAMES 'utf8'");

//$pvs4= mysqli_query($con_pvs4," SELECT id,id_number,customer,pvs3_id FROM `products` WHERE  `pvs3_id`>0 ORDER BY `pvs3_id` DESC LIMIT 999000; ");
$sql= " SELECT * FROM `anschlagmittel` WHERE  `pvs4_id`=0 AND aktiv=1 ORDER BY `idAnschlagmittel` DESC LIMIT 1200; ";
$pvs3= mysqli_query($con_pvs3, $sql);


if($pvs3){
    $anz_all = mysqli_num_rows($pvs3);
    echo "anz_all:".$anz_all."  <br>  ";
    $anz_k = 0;
    if(mysqli_num_rows($pvs3) > 0){
        while ($prod = mysqli_fetch_assoc($pvs3)) {
            $prod = utf8encodeArray($prod);
            $pvs3_kunde_id = intval($prod['Kunden_idKunde']);
            $pvs3_prod_id = intval($prod['idAnschlagmittel']);
            $sql= " SELECT * FROM `kunden`  WHERE  `idKunde`=$pvs3_kunde_id   ";
            $pvs3_kunde = mysqli_query($con_pvs3, $sql);
            if(mysqli_num_rows($pvs3_kunde) > 0){
                $kunde = mysqli_fetch_assoc($pvs3_kunde);
                $kunde = utf8encodeArray($kunde);
                $aktiv = intval($kunde['Aktiv']);
                $firma = $kunde['Firma'];
                $pvs4_kunde_id = intval($kunde['pvs4_id']);
                if($pvs4_kunde_id <=0) {
                    echo " Kunde nicht überragen ???????  `idKunde`=$pvs3_kunde_id  `pvs4_kunde_id`=$pvs4_kunde_id  firma:$firma <br>  ";
                    $aktiv = 0;
                }

                //gibt es das Produkt schon (manuell eingetragen)
                $id_number  = $prod['IDNummer'];
                if(strlen($id_number)>0){
                    $sql= " SELECT * FROM `products`  WHERE  `customer`=$pvs4_kunde_id  AND id_number='$id_number'  ";
                    $pvs4_test= mysqli_query($con_pvs4, $sql);
                    if(!$pvs4_test){
                        echo " pvs4_test error <br> ".mysqli_error($con_pvs4)." <br> ".$sql;   
                        die;
                    }else{         
                        if(mysqli_num_rows($pvs4_test) > 0){
                            echo " pvs4_test gleiches Produkt gefunden: id_number=$id_number  `idKunde`=$pvs3_kunde_id  `pvs4_kunde_id`=$pvs4_kunde_id  sql=$sql <br> ";   
                            $aktiv = 0;
                        }
                    }
                    
                }               


                if($aktiv){
                    $anz_k++;
                    $licensee = 1;
                    $active   = 1;
                    $parent   = 0;
                    $customer = $pvs4_kunde_id;
                    $articel_no = $prod['ArtikelNr'];                    
                    $nfc_tag_id = $prod['NFC_UID'];
                    $qr_code = '';
                    $check_interval = intval($prod['Pruefintervall']);
                    $inspection_service = intval( $prod['Pruefservice']);    
                    $last_protocol = "";
                    $images =$prod['Bild'];
                    $t = utf8encodeArray ( array('de'=>$prod['EingabeObjekt'],'en'=>$prod['EingabeObjekt'],'it'=>$prod['EingabeObjekt'],'fr'=>$prod['EingabeObjekt']  ) );
                    $title = json_encode( $t , JSON_UNESCAPED_UNICODE );               
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

                    $last_protocol = json_encode( $last_protocol , JSON_UNESCAPED_UNICODE );
                    $items = json_encode( $items , JSON_UNESCAPED_UNICODE );

                    $pvs3_prod_id = $prod['idAnschlagmittel'];

                    $sql = "INSERT INTO `products` (`pvs3_id`,`title`, `customer`, `id_number`, `parent`, `active`, `inspection_service`, `check_interval`, `last_protocol`, `articel_no`, `items`, `images`, `nfc_tag_id`, `qr_code`) 
                            VALUES ($pvs3_prod_id,'$title',$customer,'$id_number',$parent,$active,$inspection_service,$check_interval,'$last_protocol','$articel_no','$items','$images','$nfc_tag_id','$qr_code' );";
                                
                    $insert= mysqli_query($con_pvs4, $sql);
                    $prod_id = mysqli_insert_id($con_pvs4);
                    if(!$insert){
                        echo " - insert products error <br> ".mysqli_error($con_pvs4)." <br> ".$sql;   
                        die;
                    }else{         
                        $sql= "UPDATE `anschlagmittel` SET `pvs4_id`=$prod_id  WHERE idAnschlagmittel =$pvs3_prod_id ";
                        $update= mysqli_query($con_pvs3, $sql);
                        echo " insert products ok id_number:$id_number  customer:$customer  pvs3_kunde_id:$pvs3_kunde_id   <br> "; 
                    }
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
                                $title = json_encode( $t , JSON_UNESCAPED_UNICODE );    
                                $protocol_number = intval($pruef['Protokoll_Nr']);
                                $product = '[{"id":"'.$prod_id.'","id_number":"'.$id_number.'"}]';
                                $protocol_date = $pruef['Datum']." 08:00:00";
                                $protocol_date_next = $pruef['DatumNext'];
                                $result = intval($pruef['Entscheidung']);
                                $pvs3_pruef_id =intval($pruef['idPruefungen']);
                                $items = "[";  
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
                                            
                                $insert= mysqli_query($con_pvs4_pr, $sql);
                                if(!$insert){
                                    echo " - insert protocols error <br> ".mysqli_error($con_pvs4)." <br> ".$sql;  
                                    die;
                                }
                                $pruef_id = mysqli_insert_id($con_pvs4_pr);
                                echo " insert protocols   pruef_id:$pruef_id  <br> ";
                            }
                        }
                    }


                }else{
                    //echo " Kunde nicht aktiv `idKunde`=$pvs3_kunde_id  <br>  ";
                }
            }else{
                echo " Kunde nicht gefunden  `idKunde`=$pvs3_kunde_id  <br>  ";
            }
        }
    }
    echo " ende  anz_k=$anz_k<br>  ";
}else{
    echo "<br> <br> mysqli_error:".mysqli_error($con_pvs3); 
    echo "<br> $sql <br>";
}