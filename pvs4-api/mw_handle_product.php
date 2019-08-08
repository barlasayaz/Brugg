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
    $action  =  trim( mysqli_escape_string($con,$_POST['action']) ) ;
    $tab = "products"; 

    if(strcmp($action , 'f') == 0){
        $id  = intval ( trim( mysqli_escape_string($con,$_POST['id']) ) );
        $sql = "SELECT COUNT(id) AS x FROM $tab where `id`=$id;";
        $ret_sql= mysqli_query( $con, $sql );
        if($ret_sql) {
            $row = mysqli_fetch_assoc($ret_sql);
            if($row['x']==0){
                http_response_code(200);
                $ok = new \stdClass();
                $ok->next = $id;
                echo json_encode($ok);
                mysqli_close($con);
                die;
            }else{
                $sql = "SELECT MAX(id) AS y FROM $tab ;";
                $ret_y= mysqli_query( $con, $sql );
                $row_max = mysqli_fetch_assoc($ret_y);
                http_response_code(200);
                $ok = new \stdClass();
                $ok->next = intval($row_max['y'])+1;
                echo json_encode($ok);
                mysqli_close($con);
                die;
            }
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'SQL Error';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }
    }else if(strcmp($action , 'i') == 0){
        $active                 = intval( trim( mysqli_escape_string($con,$_POST['active'] ) ) );
        $customer               = intval( $_POST['customer'] );
        $parent                 = intval( $_POST['parent'] );
        $check_interval         = intval( $_POST['check_interval'] );
        $articel_no             = trim( mysqli_escape_string($con,$_POST['articel_no']) );
        $customer_description   = trim( mysqli_escape_string($con,$_POST['customer_description']) );
        $title                  = trim( mysqli_escape_string($con,$_POST['title']) );
        $id_number              = trim( mysqli_escape_string($con,$_POST['id_number']) );    
        $items                  = trim( mysqli_escape_string($con,$_POST['items']) );
        $images                 = trim( mysqli_escape_string($con,$_POST['images']) );
        $nfc_tag_id             = trim( mysqli_escape_string($con,$_POST['nfc_tag_id']) );  

        $sql="  INSERT INTO products (active,customer,parent,title,id_number,items,check_interval,articel_no,customer_description,images,nfc_tag_id)
                VALUES($active,$customer,$parent,'$title','$id_number','$items',$check_interval,'$articel_no','$customer_description','$images','$nfc_tag_id')";

        $ret_sql= mysqli_query( $con, $sql );
        if($ret_sql) {
            $id = $con->insert_id;
            http_response_code(200);
            $ok = new \stdClass();
            $ok->id = $id;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 1';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }

    }else if(strcmp($action , 'u') == 0){
        $id                     = intval( trim( mysqli_escape_string($con,$_POST['id']) ) );
        $active                 = intval( trim( mysqli_escape_string($_POST['active'] ) ) );
        $customer               = intval( $_POST['customer'] );
        $parent                 = intval( $_POST['parent'] );
        $check_interval         = intval( $_POST['check_interval'] );
        $articel_no             = trim( mysqli_escape_string($con,$_POST['articel_no']) );
        $customer_description   = trim( mysqli_escape_string($con,$_POST['customer_description']) );
        $title                  = trim( mysqli_escape_string($con,$_POST['title']) );
        $id_number              = trim( mysqli_escape_string($con,$_POST['id_number']) );    
        $items                  = trim( mysqli_escape_string($con,$_POST['items']) );
        $images                 = trim( mysqli_escape_string($con,$_POST['images']) );
        $nfc_tag_id             = trim( mysqli_escape_string($con,$_POST['nfc_tag_id']) ); 
        $sql="  UPDATE products 
                   SET active = $active,
                       customer = $customer,
                       parent = $parent,
                       title = '$title', 
                       id_number = '$id_number',
                       check_interval = $check_interval,
                       articel_no = '$articel_no', 
                       customer_description = '$customer_description',
                       items = '$items',
                       images = '$images',
                       nfc_tag_id = '$nfc_tag_id'
                 WHERE id =$id";
        $ret_sql= mysqli_query( $con, $sql );
        if($ret_sql) {
            http_response_code(200);
            $ok = new \stdClass();
            $ok->id = $id;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 2';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }

    }else if(strcmp($action , 'd') == 0){
        $id        = intval( trim( mysqli_escape_string($con,$_POST['id']) ) );
        $active    = 0;
        $sql="UPDATE $tab SET active =$active WHERE id =$id";
        $ret_sql= mysqli_query( $con, $sql );
        if($ret_sql) {
            http_response_code(200);
            $ok = new \stdClass();
            $ok->id = $id;
            echo json_encode($ok);
            mysqli_close($con);
            die;
        }else{
            // return 500 problem with query.
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 3';
            echo json_encode($error);
            mysqli_close($con);
            die;
        }
    }else {
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'unknown action';
        echo json_encode($error);
        mysqli_close($con);
        die;
    }
  
   
}

// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST
