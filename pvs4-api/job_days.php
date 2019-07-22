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
        processing( );
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
    
    global $database_location_2,$database_username_2,$database_password_2,$database_name_2;
    $con_pr=mysqli_connect($database_location_2,$database_username_2,$database_password_2,$database_name_2);

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
    $id = 0; 
    if(isset($_POST['id'])) $id   = intval($_POST['id'] );
    $mode = 0; 
    if(isset($_POST['mode'])) $mode   = intval($_POST['mode'] );
    
    $sql    = "SELECT * FROM `products` WHERE `active` = 1 AND `customer` = $id;";
    $ret_sql= mysqli_query( $con, $sql );

    $liste = [];
    $anz_liste = 0;
    $days10 = 0;
    $days30 = 0;
    $days90 = 0;
    if($ret_sql) {
        if(mysqli_num_rows($ret_sql) > 0){
            while ($row = mysqli_fetch_assoc($ret_sql)) {
                $pid = $row['id'];
                $where = "SELECT * FROM `protocols` WHERE `product` LIKE '%\"id\":\"$pid\"%' ORDER by protocol_date DESC, id DESC LIMIT 1;" ;
                $prot= mysqli_query( $con_pr, $where  );
                if($prot) {
                    if(mysqli_num_rows($prot) > 0){
                        $prot_row = mysqli_fetch_assoc($prot);
                        if($prot_row['result']==0){ 
                            $PR_next_time = strtotime($prot_row['protocol_date']);
                            if( $row['check_interval']>0) $PR_next_time += $row['check_interval'] * (60*60*24*30.4);
                            else $PR_next_time += 12 * (60*60*24*30.4);                         
                            //$PR_next_time = date("Y-m-d", $PR_next_time ) ;
                            //echo $PR_next_time."<br><br>";
                            $diffTime = $PR_next_time - time();
                            if( $diffTime <= (60*60*24*10)){
                                $days10++;
                            } else if( $diffTime <= (60*60*24*30)){
                                $days30++;
                            } else if( $diffTime < (60*60*24*90)){
                                $days90++;
                            }
                        }
                    }
                }
                //echo $where."<br>";
            }
        }

        $days= json_encode (array( "days10" => $days10,"days30" => $days30,"days90" => $days90) );
        $days_review = date("Y-m-d", time() ) ;

        //echo $days."<br>".$days_review ;
        $sql="UPDATE customer  SET  `days` ='$days', `days_review` = '$days_review' WHERE id =$id";

        $ret_sql= mysqli_query( $con, $sql );

        if($ret_sql) {
            http_response_code(200);
            $ok = new \stdClass();
            $ok->amount = 1;
            $ok->days10 = $days10;
            $ok->days30 = $days30;
            $ok->days90 = $days90;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error 1';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }
    }else{
        // return 500 problem with query.
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error 2';
        echo json_encode($error);
        mysqli_close($con);
        die;
    }
 
}

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
