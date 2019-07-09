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
    $id                 = intval( $_POST['id'] );
    $protocol_number    = intval( $_POST['protocol_number'] );
    $active             = intval( $_POST['active'] );
    $customer           = intval( $_POST['customer'] );
    $product            = trim( mysqli_escape_string($con,$_POST['product']));
    $title              = trim( mysqli_escape_string($con,$_POST['title']));
    $protocol_date      = trim( mysqli_escape_string($con,$_POST['protocol_date']));
    $protocol_date_next = trim( mysqli_escape_string($con,$_POST['protocol_date_next']));
    $result             = intval( $_POST['result'] );
    $items              = trim( mysqli_escape_string($con,$_POST['items']));
    $author             = "";
    if(isset($_POST['author'])) $author = trim( mysqli_escape_string($con,$_POST['author']));	
    
    if($id > 0) {
        $sql=" UPDATE protocols SET active = $active, protocol_number = $protocol_number, customer = $customer,  
               title = '$title', items = '$items', product = '$product', protocol_date = '$protocol_date',
               result = $result,  protocol_date_next = '$protocol_date_next', author='$author' WHERE id = $id"; 
    } else {
        $sql = "SELECT max(protocol_number)+1 as protocol_number FROM protocols WHERE customer=$customer";
        $ret_sql = mysqli_query( $con, $sql );
        while( $sonuc = mysqli_fetch_object($ret_sql) ){
            if($sonuc->protocol_number > 0){
                $prtcl_num = $sonuc->protocol_number;
            } else {
                $prtcl_num = 1;
            }
        }
        $sql=" INSERT INTO protocols (active,protocol_number,customer,title,items,product,protocol_date,protocol_date_next,result, author )
               VALUES($active,$prtcl_num,$customer,'$title','$items','$product','$protocol_date','$protocol_date_next',$result, '$author')     "; 
   }
    $ret_sql= mysqli_query( $con, $sql );   

    if($ret_sql) {
        if($id==0) $id = $con->insert_id;
        //set products - last_protocol
        $last_protocol = array(
            'id'                 => $id ,
            'protocol_date'      => substr($protocol_date,0,10) ,
            'protocol_date_next' => substr($protocol_date_next,0,10)  ,
            'result'             => $result
        );
        $last_protocol = json_encode($last_protocol);
        $products = (array) json_decode( $_POST['product'] , true);
        foreach ($products  as $key => $value){
            //print_r($value);
            $vid = $value['id'];
            $sql=" UPDATE products SET last_protocol= '$last_protocol'  WHERE id =$vid "; 
            $ret= mysqli_query( $con, $sql );   
        }

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
        $error->message = 'Internal Server Error 1';
        $error->message2 = 'Error :'.mysqli_error($con);
        $error->message3 = $sql;
        echo json_encode($error);
        mysqli_close($con);
        die;
    }
}

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
