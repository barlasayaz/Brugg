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
        // if we are passed an email 
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
        // delete an existing contact
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
    if( !isset( $_POST['bruggid'] ) || !isset( $_POST['token'] ) ){
        http_response_code($response->code);
        $error = new \stdClass();
        $error->message = 'not verified';
        $error->error = 5;
        $error->oauth2 = $response->body;
        echo json_encode($error);
        die;
    }
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
    
    $sql    = "SELECT * FROM `customer` WHERE  `id`=$id;";
    $customer= mysqli_query( $con, $sql );
    if($customer) {
        $obj = mysqli_fetch_assoc($customer);  
        //Produkte
        // Anzahl aktive Produkte 
        $sql = "SELECT COUNT(id)  from products WHERE customer=$id AND active=1 ";
        $res = mysqli_query( $con, $sql );
        $aktive_products = mysqli_fetch_array($res,  MYSQLI_NUM);
        $aktive_products= $aktive_products[0] ;
        // Anzahl inaktive Produkte 
        $sql = "SELECT COUNT(id) from products WHERE customer=$id AND active=0 ";
        $res = mysqli_query( $con, $sql );
        $inaktive_products = mysqli_fetch_array($res,  MYSQLI_NUM);
        $inaktive_products= $inaktive_products[0] ;
        // Anzahl aktive Produkte und Prüfservice
        $sql = "SELECT COUNT(id)  from products WHERE customer=$id AND active=1 AND inspection_service=1 ";
        $res = mysqli_query( $con, $sql );
        $inspection_service = mysqli_fetch_array($res,  MYSQLI_NUM);
        $inspection_service= $inspection_service[0] ;

        // sales employee
        $obj['sales'] = intval( $obj['sales'] );    
        $obj['sales_email'] = "";
        if($obj['sales']>0){
            $x = $obj['sales'] ;
            $sql    = "SELECT * FROM `profiles` WHERE  `id`=$x ;";
            $sales= mysqli_query( $con, $sql );
            if($sales) {
                $s = mysqli_fetch_assoc($sales); 
                $obj['sales_email'] = $s['email'];
            }
        }

        // tester employee
        $obj['tester'] = intval( $obj['tester'] );
        $obj['tester_email'] = "";
        if($obj['tester']>0){
            $x = $obj['tester'] ;
            $sql    = "SELECT * FROM `profiles` WHERE  `id`=$x ;";
            $tester= mysqli_query( $con, $sql );
            if($tester) {
                $s = mysqli_fetch_assoc($tester); 
                $obj['tester_email'] = $s['email'];
            }
        }
    }

    if($customer) {
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = 1;
        $ok->aktive_products = $aktive_products;
        $ok->inaktive_products = $inaktive_products;
        $ok->inspection_service = $inspection_service;
        $ok->obj = $obj;        
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
