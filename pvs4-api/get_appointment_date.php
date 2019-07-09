<?php
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS,  PUT, DELETE');

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
        if(isset($_POST['idCustomer']) ) {
            processing( $_POST['idCustomer']  );
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



function processing($idCustomer) {
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

    $lv = "";
    $nv = "";
    $lt = "";
    $nt = "";

    //--------------------------last visit---------------------------    
    $idCustomer   = intval( trim( mysqli_escape_string($con,$_POST['idCustomer']) ) );
    $sql = "SELECT * FROM `appointment` 
            WHERE appointment_date < NOW() AND `idCustomer` = $idCustomer AND appointment_type=0 AND `active` = 1 ORDER by appointment_date DESC LIMIT 1;";
    $ret_sql= mysqli_query( $con, $sql );    
    if($ret_sql) {
        while ($row = mysqli_fetch_assoc($ret_sql)) {           
            $lv= $row['appointment_date'];
        }
    }
    //--------------------------next visit---------------------------    
    $sql = "SELECT * FROM `appointment` 
            WHERE appointment_date >= NOW() AND `idCustomer` = $idCustomer AND appointment_type=0 AND `active` = 1 ORDER by appointment_date ASC LIMIT 1;";
    $ret_sql= mysqli_query( $con, $sql );
    if($ret_sql) {
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            $nv= $row['appointment_date'];
        }
    }
    //--------------------------last test---------------------------    
    $sql = "SELECT * FROM `appointment` 
            WHERE appointment_date < NOW() AND `idCustomer` = $idCustomer AND appointment_type=1 AND `active` = 1 ORDER by appointment_date DESC LIMIT 1;";
    $ret_sql= mysqli_query( $con, $sql );
    if($ret_sql) {
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            $lt= $row['appointment_date'];
        }
    }
    //--------------------------next test---------------------------    
    $sql = "SELECT * FROM `appointment` 
            WHERE appointment_date >= NOW() AND `idCustomer` = $idCustomer AND appointment_type=1 AND `active` = 1 ORDER by appointment_date ASC LIMIT 1;";
    $ret_sql= mysqli_query( $con, $sql );
    if($ret_sql) {
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            $nt= $row['appointment_date'];
        }
    }
    http_response_code(200);
    $ok = new \stdClass();
    $ok->last_visit = $lv;
    $ok->next_visit = $nv;
    $ok->last_inspection = $lt;
    $ok->next_inspection = $nt;
    $ok->amount = 1;    
    echo json_encode($ok);
    mysqli_close($con);
    die;

}