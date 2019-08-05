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

    global $database_location_2,$database_username_2,$database_password_2,$database_name_2;
    $con_pvs4_pr=mysqli_connect($database_location_2,$database_username_2,$database_password_2,$database_name_2);

    $con_pvs3=mysqli_connect('db2412.1und1.de','dbo322099820','1qay2wsx','db322099820');
    mysqli_query($con_pvs4,"SET NAMES 'utf8'");
    mysqli_query($con_pvs4_pr,"SET NAMES 'utf8'");
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

    $list_p= mysqli_query($con_pvs4,"SELECT id , last_protocol,pvs3_id FROM `products` WHERE `last_protocol` NOT LIKE '%}%' AND `last_protocol` LIKE '%{%' AND pvs3_id>0 ORDER BY `products`.`pvs3_id` ASC LIMIT 1200 ");
  
    if($list_p){             
        if(mysqli_num_rows($list_p) > 0){
            while ($row = mysqli_fetch_assoc($list_p)) { 
                $id = $row['id'];
                $last_protocol = trim( $row['last_protocol']) ;
                $pvs3_id = $row['pvs3_id'];
        
                $last_protocol = array(
                    'id'        => 0,
                    'protocol_date'      => "" ,
                    'protocol_date_next' => "" ,
                    "result" => 0
                );    

                $info = mysqli_query($con_pvs3, "SELECT * FROM anschlagmittel_info WHERE id=".$pvs3_id .";" );
                if($info){
                    if(mysqli_num_rows($info) > 0){
                        $t = mysqli_fetch_array($info);
                        $x= $t['last_pr'];
                        if (strpos($x, '.') != false) {
                            $st = explode('.',$x);
                            $last_protocol['protocol_date'] = $st[2].'-'.$st[1].'-'.$st[0];
                        }
                        $x= $t['next_pr'];
                        if (strpos($x, '.') != false) {
                            $st = explode('.',$x);
                            $last_protocol['protocol_date_next'] = $st[2].'-'.$st[1].'-'.$st[0];                                    
                        }else if( strpos($x, 'reparieren') != false) {
                            $last_protocol['result'] = 1;
                        }else if( strpos($x, 'unauffindbar') != false) {
                            $last_protocol['result'] = 3;
                        }else if( strpos($x, 'ausmustern') != false) {
                            $last_protocol['result'] = 4;
                        }
                    }  
                }

                $last_protocol = json_encode( $last_protocol , JSON_UNESCAPED_UNICODE );
                $update = mysqli_query($con_pvs4, "UPDATE `products` SET `last_protocol` = '$last_protocol' WHERE `products`.`id` = $id;" );
                
                $anz++; 
                //echo "<br>  anz : ".$anz."  lp: ".$last_protocol;
            }
            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = $anz;
            echo json_encode($ok);
            mysqli_close($con_pvs4);
            die; 
        }else{
            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = 0;
            $ok->obj = '[]' ;
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