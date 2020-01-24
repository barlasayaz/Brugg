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


$pvs4_pr= mysqli_query($con_pvs4,"SELECT * FROM `test`  ORDER BY `test`.`id` ASC ");
echo " start<br> ";
$anz1 = 0;
$anz2 = 0;
$anz0 = 0;
if($pvs4_pr){
    if(mysqli_num_rows($pvs4_pr) > 0){
        while ($pruef = mysqli_fetch_assoc($pvs4_pr)) {
            $pruef = utf8encodeArray($pruef);
            $new_items = array();
            //$idnr = trim($pruef['IDNr']);
            //$sql="  SELECT * FROM `customer` WHERE `customer_number` LIKE '%$idnr%' AND licensee=1 ";

            $firma  = trim($pruef['Firma']);
            
            $sql="  SELECT * FROM `customer` WHERE `company` LIKE '%".$firma."%' AND licensee=1 ";
            $ret_sql= mysqli_query( $con_pvs4, $sql );

            $x = mysqli_num_rows($ret_sql);

            if($x == 1 ){
                $anz1++;
            }if($x > 1){
                $anz2++;
            }else{
                $anz0++;
            }
        }  
    }
}
echo " ende<br> ";
echo " anz0: $anz0<br>   anz1: $anz1<br>   anz2: $anz2<br> ";