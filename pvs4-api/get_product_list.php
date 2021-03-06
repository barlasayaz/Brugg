<?php
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
header('Access-Control-Allow-Methods: GET, POST,  OPTIONS, PUT, DELETE');

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
        // if we are passed an email 
        if(isset($_POST['user']) ) {
            processing( $_POST['user'], $_POST['customer']  );
        }else{
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 1';
            echo json_encode($error);     
        }
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


function processing($user, $customer) {
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
    $user      = trim( mysqli_escape_string($con,$user) );
    $customer  = intval ( trim( mysqli_escape_string($con,$customer) ) );
    $active    = 1;
    if(isset($_POST['active'])) $active = intval ( trim( mysqli_escape_string($con,$_POST['active']) ));
    
    $sql    = "SELECT * FROM `products` where `customer` = $customer AND `active` = $active ORDER BY `parent`, `id` desc;";
    $ret_sql= mysqli_query( $con, $sql );

    $liste = [];
    $child_liste = [];
    $anz_liste = 0;
    if($ret_sql) { 
        // OK
        function recu_find_parent(&$arr, $child){
            foreach ($arr as &$value) {
                if($value['data']['id']==$child['parent']){
                    if(isset($value['children'])){
                        $value['children'][] = array('data' => $child);
                    }else{
                        $value['children'] = array();
                        $value['children'][] = array('data' => $child); 
                    }
                    return 1;
                }else{
                    if(isset($value['children'])){
                        $ret = recu_find_parent($value['children'], $child); 
                        if($ret == 1) return 1;
                    }
                }   
            }
            return 0;
        }
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            if($row['parent']==0){
                $liste[] = array('data' => utf8encodeArray($row) );
            }else{
                if(recu_find_parent($liste, utf8encodeArray($row)) == 0) $child_liste[] = utf8encodeArray($row);
            }            
            $anz_liste++;
        }
        
        $len = count($child_liste);
        $rest = [];
        if( $len > 0){            
            for($i=0; $i<$len; $i++ ){
                $row = $child_liste[$i];
                if(recu_find_parent($liste, $row) == 0)  $rest[] = $row;
            }
        }

        $len = count($rest);
        $rest2 = [];
        if( $len > 0){            
            for($i=0; $i<$len; $i++ ){
                $row = $rest[$i];
                if(recu_find_parent($liste, $row) == 0)  $rest2[] = $row;
            }
        }
       
        
//print_r($liste);
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = $anz_liste;
        $ok->list = $liste;       
        $ok->rest = $rest2;
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

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
