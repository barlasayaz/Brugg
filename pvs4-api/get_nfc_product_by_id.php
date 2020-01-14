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
        if(isset($_POST['id']) ) {
            processing( $_POST['id']  );
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

function processing($id) {

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
    $id   = trim( mysqli_escape_string($con,$id) );
    $id   = intval($id);
    $sql_4    = "SELECT * FROM `products` WHERE  `nfc_tag_id` != '' AND  `id`=$id;";
    $ret_sql_4= mysqli_query( $con, $sql_4 );

    $sql_3    = "SELECT * FROM `products` WHERE  `nfc_tag_id` != '' AND `pvs3_id`=$id;";
    $ret_sql_3= mysqli_query( $con, $sql_3 );

    $liste = [];
    $anz_liste = 0;

    if($ret_sql_4 && $ret_sql_3) {
        http_response_code(200);
        $ok = new \stdClass();

        $anz_4 = mysqli_num_rows($ret_sql_4);
        $anz_3 = mysqli_num_rows($ret_sql_3);

        if(( $anz_4 > 0) && ($anz_3 >0)){
            $ok->amount = 2;
            $ok->obj_pvs3 = mysqli_fetch_assoc($ret_sql_3);
            $ok->obj_pvs4 = mysqli_fetch_assoc($ret_sql_4);
        }else if( $anz_4 > 0) {
            $ok->amount = 1;
            $ok->obj = mysqli_fetch_assoc($ret_sql_4);
        }else if( $anz_3 > 0) {
            $ok->amount = 1;
            $ok->obj = mysqli_fetch_assoc($ret_sql_3);
        }else{
            $ok->amount = 0;
            $ok->obj = [];
        }
        echo json_encode($ok);
        mysqli_close($con);
        die;
    }else{
        // return 500 problem with query.
        http_response_code(500);
        $error = new \stdClass();
        $error->error = 6;
        $error->message = 'Internal Server Error';
        echo json_encode($error);
        mysqli_close($con);
        die;
    }
 
}

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
