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
        if(isset($_POST['id']) ) {
            processing( $_POST['id'], $_POST['type'] );
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

function processing($id, $type) {
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
    //ok
    $files=  array();

    $dir        = $file_dir;
    $link       = $file_link;
    $file_link  = $file_link;

    if($_POST['type']=="protocol"){
        $dir .='protocol_'.$_POST['id'];
        $link.='protocol_'.$_POST['id'];
    }
    if($_POST['type']=="product"){
        $dir .='product_'.$_POST['id'];
        $link.='product_'.$_POST['id'];
    }

    if(is_dir($dir)) {
        $dateien = scandir($dir);  
        if( $dateien ){
            $nr = 1;
            foreach( $dateien as $datei){
                if(is_file($dir.'/'.$datei)){
                    $files[] =  $datei ;
                    if($datei=="KraftWegGraph.txt"){
                        $output['KraftWegGraph']= array();
                        $zeilen = file_get_contents($dir.'/'.$datei, NULL, NULL, 0, 55000);
                        $zeilen = explode("\n", $zeilen ) ; 
                        $x = count($zeilen); 
                        for($k=0; $k<$x; $k++){
                            $p = explode(";", $zeilen[$k] ) ; 
                            if(count($p)>=2){
                                $output['KraftWegGraph'][]= array( 'x'=>intval($p[0]), 'y'=>intval($p[1]));
                            }else{
                                break;
                            }
                        }
                    }
                }
            }
        }
    } 
    $output['anz'] =  count($files); 
    $output['files']=  $files; 
    $output['dir'] =  $dir.'/'; 
    $output['id'] =  $_POST['id'];
    $output['link'] =  $link.'/';
    $output['file_link'] = $file_link;    
    echo json_encode($output );
 
}