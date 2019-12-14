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
    case "GET":
        // if we are passed an email
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error: 0';
        echo json_encode($error);
        die;
    case "POST":
        // if we are passed an email
        if(isset($_POST['fileName']) ) {
            reportMedia( $_POST['fileName'] );
        }else{
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 1';
            echo json_encode($error);
            die;
        }
    case "PUT":
        // update an existing contact
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error: 2';
        echo json_encode($error);
        die;
    case "DELETE":
        // delete an existing contact
        http_response_code(500);
        $error = new \stdClass();
        $error->message = 'Internal Server Error: 4';
        echo json_encode($error);
    	die;
}

// you will most likely need to know at some point who is calling this resource to get resources related to that user.
// you can get the current user_name by calling the below code, it converts the access token to the related username.

// $token = $server->getAccessTokenData(OAuth2\Request::createFromGlobals());
// This contains the current user -> $token['user_id']



function reportMedia($fileName) {
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
    //ok
    $files=  array();
    $filesMime=  array();
    if(($_SERVER['HTTP_HOST'] == 'localhost')||($_SERVER['HTTP_HOST'] == '192.168.1.102')){
        $link = 'http://192.168.1.102/BruggPVS4/attachments/';
    }else{
        $link = 'https://www.pvs2go.com/attachments/';
    }

    // Api http://localhost/BruggPVS4/attachments/
    // $dir  = '../attachments/mobileimages/';

    // Api https://www.pvs2go.com/attachments/
    // $dir  = 'attachments/mobileimages/';

    $dir  = 'attachments/mobileimages/';
    $filesData=  array();

    function getDataURI($image, $mime = '') {
        return 'data: '.(function_exists('mime_content_type') ? mime_content_type($image) : $mime).';base64,'.base64_encode(file_get_contents($image));
    }

    if(is_dir($dir)) {
        $dateien = scandir($dir);
        if( $dateien ){
            $nr = 1;
            foreach( $dateien as $datei){                
                if ($datei == $fileName) {
                    if(is_file($dir.'/'.$datei)){
                        $file =  $datei ;
                        $fileDataUri = getDataURI($dir.'/'.$datei) ;
                    }
                }                
            }
        }
    }
    $output['file']=  $file;
    $output['fileDataUri']=  $fileDataUri;
    $output['fileName'] =  $_POST['fileName'];

    //echo json_encode($output );
    http_response_code(200);
    $ok = new \stdClass();
    $ok->anz = 1;
    echo json_encode($output);
    mysqli_close($con);
    die;
}

// here you could write functions to update an existing contact or delete a contact.
// any information posted from you Ionic app would be in the object $_POST
