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

global $brugg_id_api,$database_location,$database_username,$database_password,$database_name;
$con_pvs4=mysqli_connect($database_location,$database_username,$database_password,$database_name);


mysqli_query($con_pvs4,"SET NAMES 'utf8'");


$pvs4_pr= mysqli_query($con_pvs4,"SELECT * FROM `products` WHERE `nfc_tag_id` != '' AND `pvs3_id` > 0 ");
echo " start<br> ";
$anz = 0;
if($pvs4_pr){
    if(mysqli_num_rows($pvs4_pr) > 0){
        while ($pruef = mysqli_fetch_assoc($pvs4_pr)) {
            $pruef = utf8encodeArray($pruef);
            $new_items = array();
            $pvs3_id = $pruef['pvs3_id'];

            
            $sql="  SELECT * FROM `products` WHERE `nfc_tag_id` != '' AND id=$pvs3_id ";
            $ret_sql= mysqli_query( $con_pvs4, $sql );

            if(mysqli_num_rows($ret_sql) > 0){
                $anz++;
                echo " bad  id:$pvs3_id anz:$anz<br> ";

            }else{
                //echo " ok  id:$pvs3_id anz:$anz<br> ";
            }
        }  
    }
}
echo " ende<br> ";