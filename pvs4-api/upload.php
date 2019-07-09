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
        if(isset($_FILES) ) {
            processing();
            die;
        }else{
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 1';
            echo json_encode($error);
            die;
        } 
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
    global $file_dir, $file_link;

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

    if ( !empty( $_FILES ) ) {
        $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];

        $uploadPath = $file_dir.$_POST['dir'];
        if(!is_dir($uploadPath)) {
            mkdir($uploadPath);
        }
    
        $ret = move_uploaded_file( $tempPath, $uploadPath.'/'.$_FILES[ 'file' ][ 'name' ] );
        echo $uploadPath.'/'.$_FILES[ 'file' ][ 'name' ] ;
    
        if(ret)   $answer = array( 'answer' => 'File transfer completed' );
        else $answer = array( 'answer' => 'Error: move_uploaded_file()' );
        $json = json_encode( $answer );
    
        echo $json;
    } 
    
    if(!empty($_POST['aktion']) && ($_POST['aktion']=="KraftWegGraph") ) {
        $daten = $_POST['KraftWegGraph'];

        $dir = $file_dir;
        if(!is_dir($dir)) {
            mkdir($dir);
        }
        $dir.="/KraftWegGraph.txt";
        $myfile = fopen($dir, "w");
        fwrite($myfile, $daten );
    
        $answer = array( 'aktion' => 'KraftWegGraph' , 'dir'=>$dir);
        echo json_encode( $answer );
    }
}

?>