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
            processing();
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
    $id   = intval( $_POST['id'] );
    $active   = intval($_POST['active'] );
    $company   = trim( mysqli_escape_string($con,$_POST['company']) );
    $country   = trim( mysqli_escape_string($con,$_POST['country']) );
    $customer_number   = trim( mysqli_escape_string($con,$_POST['customer_number']) );
    $email   = trim( mysqli_escape_string($con,$_POST['email']) );
    $licensee   = intval($_POST['licensee'] );
    $parent   = intval($_POST['parent'] );
    $phone   = trim( mysqli_escape_string($con,$_POST['phone']) );
    $place   = trim( mysqli_escape_string($con,$_POST['place']) );
    $po_box   = trim( mysqli_escape_string($con,$_POST['po_box']) );
    $rating   = trim( mysqli_escape_string($con,$_POST['rating']) );
    $sector   = trim( mysqli_escape_string($con,$_POST['sector']) );
    $street   = trim( mysqli_escape_string($con,$_POST['street']) );
    $website   = trim( mysqli_escape_string($con,$_POST['website']) );
    $zip_code   = trim( mysqli_escape_string($con,$_POST['zip_code']) );
    $note   = trim( mysqli_escape_string($con,$_POST['note']) );
    $sales   = 0;
    $tester  = 0;
    if(isset($_POST['sales'])) $sales   = intval($_POST['sales'] );
    if(isset($_POST['tester'])) $tester   = intval($_POST['tester'] );

    if($id >0) {
        $sql="UPDATE customer 
                SET active =$active , company = '$company',country ='$country', customer_number = '$customer_number'
                        ,email ='$email', licensee = $licensee,parent =$parent, phone = '$phone'
                        ,place ='$place', po_box = '$po_box',rating ='$rating', sector ='$sector', 
                        street = '$street',website ='$website', zip_code = '$zip_code', note = '$note', 
                        sales = $sales, tester = $tester 
                WHERE id =$id";
    } else {
        $sql="INSERT INTO customer (active,company,country,customer_number,email,licensee,parent,phone,place,po_box,rating,sector,street,website,zip_code,note,sales,tester)
                VALUES($active,'$company','$country','$customer_number','$email',$licensee,$parent,'$phone'
                        ,'$place','$po_box','$rating','$sector','$street','$website','$zip_code','$note',$sales,$tester)";
    }
	$ret_sql= mysqli_query( $con, $sql );

    if($ret_sql) {
        if($id==0) $id = $con->insert_id;
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = 1;
        $ok->id = $id;
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
