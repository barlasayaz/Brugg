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
    // -------------------------------------------------
    // escape the uemailid to prevent sql injection
    $role     = intval ( trim( mysqli_escape_string($con,$_POST['role']) ) );
    $role_set = $_POST['role_set'];
    $licensee = intval ( trim( mysqli_escape_string($con,$_POST['licensee']) ));
    $list = array();
    $anz  = 0;
    $all = [];

    if($role == 0) {
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = 0;
        $ok->obj = '[]' ;
        echo json_encode($ok);
        mysqli_close($con);
        die;
    }

    if($role == 2) {
        $all= mysqli_query($con,"SELECT * FROM profiles WHERE licensee_role != '[]' ");
        if($all) {             
            if(mysqli_num_rows($all) > 0){
                $list= array();
                while ($row = mysqli_fetch_assoc($all)) {
                    $lr = json_decode($row['licensee_role']);
                    $role_nr = 0;
                    foreach ( $lr as $lrx){
                        if($lrx->licensee== $licensee){
                            $list[$anz]['id'] = $row['id'];
                            $list[$anz]['email'] = $row['email'];
                            $list[$anz]['status'] = $row['status'];
                            $list[$anz]['role_set'] = $lrx;
                            $list[$anz]['role_nr'] = $role_nr;
                            $list[$anz]['role'] = $role;
                            $list[$anz]['colour'] = $row['colour'];
                            $list[$anz]['short_code'] = $row['short_code'];  
                            $list[$anz]['first_name'] = $row['first_name'];  
                            $list[$anz]['last_name'] = $row['last_name'];                          
                            $anz++;
                        }
                        $role_nr++;
                    }
                }
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = $anz;
                $ok->obj = $list ;
                echo json_encode($ok);
                mysqli_close($con);
                die; 
            }else{
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = 0;
                $ok->obj = '[]' ;
                echo json_encode($ok);
                mysqli_close($con);
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

    if($role == 3) {
        $user   = intval( trim( mysqli_escape_string($con,$_POST['user']) ) );
        $all= mysqli_query($con,"SELECT * FROM profiles WHERE id=$user ");
        if($all) {             
            if(mysqli_num_rows($all) > 0){
                $list= array();
                while ($row = mysqli_fetch_assoc($all)) {
                    $list[$anz]['id'] = $row['id'];
                    $list[$anz]['email'] = $row['email'];
                    $list[$anz]['status'] = $row['status'];
                    $list[$anz]['colour'] = $row['colour'];
                    $list[$anz]['short_code'] = $row['short_code'];  
                    $list[$anz]['first_name'] = $row['first_name'];  
                    $list[$anz]['last_name'] = $row['last_name'];                          
                    $anz++;
                }
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = $anz;
                $ok->obj = $list ;
                echo json_encode($ok);
                mysqli_close($con);
                die; 
            }else{
                http_response_code(200);
                $ok = new \stdClass();
                $ok->amount = 0;
                $ok->obj = '[]' ;
                echo json_encode($ok);
                mysqli_close($con);
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
    
}