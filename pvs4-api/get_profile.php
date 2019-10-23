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
        if(isset($_POST['email']) ) {
            processing( $_POST['email']  );
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
    // -------------------------------------------------
    // escape the uemailid to prevent sql injection
    $check = 0;
    if(isset($_POST['check']) ) { $check = intval($_POST['check']); }
    $email = trim(strtolower( mysqli_escape_string($con,$_POST['email']) ) );
    $get_user_info= mysqli_query($con,"SELECT * FROM profiles WHERE email = '$email'");
    if($get_user_info) {             
        if(mysqli_num_rows($get_user_info) > 0){
            // ok
        }else{
            
            if($check ==1){
                //none
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = 0;
                echo json_encode($ok);
                mysqli_close($con);
                die;
            }else{
                // add profile.
                //BID Info
                $url = $brugg_id_api.'userdata.php?tick='.time();
                $data= array(
                    'client_id' => "brugg-pvs",
                    'client_secret' => 'b23c8hfqnvd3qt7865uiat',
                    'username' => $_POST['bruggid'],
                    'userdata' => $email,
                    'access_token' => $_POST['token']
                );
                $headers = array('Accept' => 'application/json');
                $body = Unirest\Request\Body::form($data); 
                $response = Unirest\Request::post($url, $headers, $body);
                $first_name = $response->body->obj->first_name;
                $last_name  = $response->body->obj->last_name;

                $date = date('Y-m-d H:i:s');
                $sqlx = "INSERT INTO profiles ( email, first_name, last_name, status, registered, last_login,system_role,licensee_role,customer_role,short_code,colour) ";
                $sqlx .= "VALUES ('$email','$first_name' ,'$last_name' , 1, '$date', '$date', '[]', '[]', '[]', '??', '#FA5511')";  
                $resx = mysqli_query($con,$sqlx);
                $get_user_info= mysqli_query($con,"SELECT * FROM profiles WHERE email = '$email'");
            }
        }
     }

     if($get_user_info) {
        if(mysqli_num_rows($get_user_info) > 0){
            $row = mysqli_fetch_assoc($get_user_info);
            if( $row['status'] != 1){
                http_response_code(401);
                $error = new \stdClass();
                $error->message = 'Account disabled, contact your administrator';
                $error->amount = 1;
                echo json_encode($error);
                die;
            }else{
                //OK
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = 1;
                $ok->obj = utf8encodeArray($row);
                $cp= mysqli_query($con,"SELECT * FROM contact_persons WHERE active = 1 AND email = '$email'");
                if($cp) {
                    $customer_role_all = mysqli_fetch_all($cp, MYSQLI_ASSOC);
                    $customer_role = array();
                    foreach ($customer_role_all as $value) {
                        //$value = json_encode($value);
                        $value['email'] = trim(strtolower($value['email']));
                        $a = array( 'id' => $value['id'], 'customer' => $value['customer'], 'email' =>$value['email'], 'first_name' => $value['first_name'], 'last_name' => $value['last_name'],  'check_products'=>$value['check_products'], 'edit_products'=>$value['edit_products']);
                        $customer_role[]=  $a;
                    }
                    $ok->obj['customer_role'] = json_encode($customer_role);
                }
                if($check == 1){
                    //BID Info
                    $url = $brugg_id_api.'userdata.php?tick='.time();
                    $data= array(
                        'client_id' => "brugg-pvs",
                        'client_secret' => 'b23c8hfqnvd3qt7865uiat',
                        'username' => $_POST['bruggid'],
                        'userdata' => $email,
                        'access_token' => $_POST['token']
                    );
                    $headers = array('Accept' => 'application/json');
                    $body = Unirest\Request\Body::form($data); 
                    $response = Unirest\Request::post($url, $headers, $body);

                    $ok->bid = array();
                    if($response->code==200){
                        $ok->bid = $response->body->obj;
                    }
                }
                echo json_encode($ok);
                mysqli_close($con);
                die;
            }
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error 4';
            echo json_encode($error);
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

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
