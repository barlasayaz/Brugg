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
    $list = array();
    $anz  = 0;

    $pvs3_obj= mysqli_query($con_pvs3,"SELECT * FROM kunden WHERE Aktiv =1  ");

    $alleMitarbeiter_res = mysqli_query($con_pvs3,"SELECT * FROM verantwortlicher  ; ");
    $alleMitarbeiter = array();
    while($mit = mysqli_fetch_array($alleMitarbeiter_res, MYSQLI_ASSOC)){
        $alleMitarbeiter[$mit['idVerantwortliche']] = $mit;
    }

  
    if($pvs3_obj){             
        if(mysqli_num_rows($pvs3_obj) > 0){
            while ($row = mysqli_fetch_assoc($pvs3_obj)) {
                if(isset( $alleMitarbeiter[ $row['Verantwortlicher_idAusendienster']  ]  ))  
                    $row['Mitarbeiter'] = $alleMitarbeiter[$row['Verantwortlicher_idAusendienster']]['Name'].', '.$alleMitarbeiter[$row['Verantwortlicher_idAusendienster']]['Vorname'];
                else
                    $row['Mitarbeiter'] = "";

                if(isset( $alleMitarbeiter[ $row['Verantwortlicher_idPruefer']  ]  ))  
                    $row['Pruefer'] = $alleMitarbeiter[$row['Verantwortlicher_idPruefer']]['Name'].', '.$alleMitarbeiter[$row['Verantwortlicher_idPruefer']]['Vorname'];
                else
                    $row['Pruefer'] = "";

                $pvs3_id = $row['idKunde'];
                $row['last_date'] = "";
                $row['next_date'] = "";             
                $info = mysqli_query($con_pvs3, "SELECT * FROM kunden_info WHERE id=$pvs3_id;" );
                if($info){                  
                    if(mysqli_num_rows($info) > 0){
                        $t = mysqli_fetch_assoc($info);                        
                        $row['last_date']  = $t['last_termin'];
                        $row['next_date']  = $t['next_termin'];
                    }
                }                                   

                $info = mysqli_query($con_pvs3, "SELECT COUNT(`idAnschlagmittel`) AS ap FROM `anschlagmittel` WHERE `aktiv`=1 AND `Kunden_idKunde`=$pvs3_id" );
                $ap = 0;
                if($info){                  
                    if(mysqli_num_rows($info) > 0){
                        $t = mysqli_fetch_assoc($info);   
                        $ap = $t['ap'];                     
                    }
                }                                  
                $row['ap'] =  $ap ;
                

                $liste[] =  utf8encodeArray($row) ;
                $anz++;
            }        
            http_response_code(200);
            $ok = new \stdClass();
            $ok->anz = $anz;
            $ok->zeilen = $liste ;
            echo json_encode($ok);
            mysqli_close($con_pvs4);
            die; 
        }else{
            http_response_code(200);
            $ok = new \stdClass();
            $ok->anz = 0;
            $ok->zeilen = '[]' ;
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