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
    $con=mysqli_connect($database_location,$database_username,$database_password,$database_name);
    mysqli_query($con,"SET NAMES 'utf8'");

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
    $_POST['bruggid'] =  trim( mysqli_escape_string($con,$_POST['bruggid']));
    $_POST['token']=   trim( mysqli_escape_string($con,$_POST['token']));
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
    //-----------------------------------------------------

    // escape the uemailid to prevent sql injection
    $type  = intval ( trim( mysqli_escape_string($con,$_POST['type']) ));
    $user  = intval ( trim( mysqli_escape_string($con,$_POST['user']) ));
    $start = trim( mysqli_escape_string($con,$_POST['start']) );
    $end   = trim( mysqli_escape_string($con,$_POST['end']) );

    $liste = [];
    $anz_liste = 0;

    if($type==1){
        $sql    = "SELECT id, customer,user,contact_person,category FROM `notes` WHERE `active` = 1 and `user` = $user and `notes_date` BETWEEN '$start' AND '$end';";
        $ret_sql= mysqli_query( $con, $sql );    
        if($ret_sql) {
 
            while ($obj = mysqli_fetch_assoc($ret_sql)) {
                $obj["name_user"] = "";
                if($obj['user']>0){
                    $id = intval($obj['user']);
                    $k= mysqli_query( $con, "SELECT first_name,last_name,id  FROM `profiles` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["name_user"] = $k['first_name']." ".$k['last_name'];
                        
                    }
                }
                $obj["name_contact"] = "";
                if($obj['contact_person']>0){
                    $id = intval($obj['contact_person']);
                    $k= mysqli_query( $con, "SELECT first_name,last_name,id  FROM `contact_persons` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["name_contact"] = $k['first_name']." ".$k['last_name'];
                    }
                }

                $obj["company"] = "";
                if($obj['customer']>0){
                    $id = intval($obj['customer']);
                    $k= mysqli_query( $con, "SELECT company,id,rating,sector,zip_code,place FROM `customer` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["company"] = $k['company'];
                        $obj["rating"] = $k['rating'];
                        $obj["sector"] = $k['sector'];
                        $obj["zipcode_place"] = $k['zip_code']." ".$k['place'];
                    }
                }

                $liste[] = array('data' => utf8encodeArray($obj) );
                $anz_liste++;
            }           

            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = $anz_liste;
            $ok->list = $liste;;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }
    }  else if($type==2){
        $sql    = "SELECT id, idCustomer,idUser,idContactPerson,appointment_type FROM `appointment` WHERE `active` = 1 and `idUser` = $user and `appointment_date` BETWEEN '$start' AND '$end';";
        $ret_sql= mysqli_query( $con, $sql );    
        if($ret_sql) {
 
            while ($obj = mysqli_fetch_assoc($ret_sql)) {
                $obj["name_user"] = "";
                if($obj['idUser']>0){
                    $id = intval($obj['idUser']);
                    $k= mysqli_query( $con, "SELECT first_name,last_name,id  FROM `profiles` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["name_user"] = $k['first_name']." ".$k['last_name'];
                        
                    }
                }
                $obj["name_contact"] = "";
                if($obj['idContactPerson']>0){
                    $id = intval($obj['idContactPerson']);
                    $k= mysqli_query( $con, "SELECT first_name,last_name,id  FROM `contact_persons` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["name_contact"] = $k['first_name']." ".$k['last_name'];
                    }
                }

                $obj["company"] = "";
                if($obj['idCustomer']>0){
                    $id = intval($obj['idCustomer']);
                    $k= mysqli_query( $con, "SELECT company,id,rating,sector,zip_code,place FROM `customer` where `id` = $id ;");
                    if($k) {
                        $k = mysqli_fetch_assoc($k);
                        $obj["company"] = $k['company'];
                        $obj["rating"] = $k['rating'];
                        $obj["sector"] = $k['sector'];
                        $obj["zipcode_place"] = $k['zip_code']." ".$k['place'];
                    }
                }

                $liste[] = array('data' => utf8encodeArray($obj) );
                $anz_liste++;
            }           

            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = $anz_liste;
            $ok->list = $liste;;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }
    }    
}
// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
