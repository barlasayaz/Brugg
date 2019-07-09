<?php
// Start the session
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
        if(isset($_POST['user']) ) {
            processing( $_POST['user']  );
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


function processing($user) {
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
    $email = $_POST['bruggid'];
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

    $user   = intval( trim( mysqli_escape_string($con,$_POST['user']) ) );
    $licensee = 5;
    $offset = 0;
    $role = 0;
    $all = 1;
    if(isset($_POST['licensee'])) $licensee = intval ( trim( mysqli_escape_string($con,$_POST['licensee']) ));
    if(isset($_POST['offset'])) $offset = intval ( trim( mysqli_escape_string($con,$_POST['offset']) ));
    if(isset($_POST['role'])) $role = intval ( trim( mysqli_escape_string($con,$_POST['role']) ));
    if(isset($_POST['all'])) $all = intval ( trim( mysqli_escape_string($con,$_POST['all']) ));

    $limit  = 9999;
    $offset = $offset * $limit ;
    if(($role==1)||($role==2)){
        if($all==1){
            $sql = "SELECT id as idCustomer, place, company, customer_number, zip_code, days FROM `customer` where (`active` = 1) AND (`licensee` = $licensee) ";
        }else{
            $sql = "SELECT id as idCustomer, place, company, customer_number, zip_code, days FROM `customer` where (`active` = 1) AND (`licensee` = $licensee)  AND ((`sales` = $user) OR (`tester` = $user)) ";
        }
    }else{
        $cp= mysqli_query($con,"SELECT * FROM contact_persons WHERE active = 1 AND email = '$email'");
        if($cp) {
            $customer_all = mysqli_fetch_all($cp, MYSQLI_ASSOC);
            $arr= array(0);
            foreach ($customer_all as $value) {
                $arr[] = $value['customer'];
            }
            $sql = "SELECT id as idCustomer, place, company, customer_number, zip_code , days FROM `customer` WHERE (`active` = 1)  AND (`id` IN (".implode(',',$arr)."))";
        }
    }

        
    $ret_sql= mysqli_query( $con, $sql );

    $liste = [];
    $anz_liste = 0;
    if($ret_sql) {
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            $liste[] = array('data' => utf8encodeArray($row) );
            $anz_liste++;
        }
    }else{
        // return 500 problem with query.
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error: 5';
        echo json_encode($error);
        mysqli_close($con);
        die;
    }


    http_response_code(200);
    $ok = new \stdClass();
    $ok->amount = $anz_liste;
    $ok->list = $liste;
    echo json_encode($ok);
    mysqli_close($con);
    die;
    
}