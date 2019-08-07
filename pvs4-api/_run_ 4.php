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

global $database_location_2,$database_username_2,$database_password_2,$database_name_2;
$con_pvs4_pr=mysqli_connect($database_location_2,$database_username_2,$database_password_2,$database_name_2);

$con_pvs3=mysqli_connect('db2412.1und1.de','dbo322099820','1qay2wsx','db322099820');

mysqli_query($con_pvs4,   "SET NAMES 'utf8'");
mysqli_query($con_pvs4_pr,"SET NAMES 'utf8'");
mysqli_query($con_pvs3,   "SET NAMES 'utf8'");

//$pvs4= mysqli_query($con_pvs4," SELECT id,id_number,customer,items,optimized FROM `products` WHERE  `optimized`=0 AND   `pvs3_id`>0 ORDER BY `pvs3_id` DESC LIMIT 3000; ");
$pvs4= mysqli_query($con_pvs4," SELECT id,optimized,pvs3_id FROM `products` WHERE  `pvs3_id`>0 AND id<5783    ORDER BY `id` DESC  LIMIT 15000;  ");

if($pvs4){
    $anz4 = mysqli_num_rows($pvs4);
    echo "<br> anz4: $anz4 ";
    if(mysqli_num_rows($pvs4) > 0){
        while ($product = mysqli_fetch_assoc($pvs4)) {
            $pvs4_id = $product['id'];
            $pvs3_id = $product['pvs3_id'];

            $sql  = " SELECT idAnschlagmittel,Kostenstelle  FROM `anschlagmittel` WHERE  `idAnschlagmittel`=$pvs3_id ; ";
            $pvs3 = mysqli_query($con_pvs3, $sql);
            
            if($pvs3){
                // echo "<br> ok ";
                if(mysqli_num_rows($pvs3) > 0){
                    // echo "<br> >0  ";
                    $obj = mysqli_fetch_assoc($pvs3);
                    $kbez= trim($obj['Kostenstelle']);

                    if(strlen($kbez)>0){
                        if(!mb_detect_encoding($kbez, 'UTF-8', true))
                        {
                            $kbez = utf8_encode($kbez);
                        }
                        $kbez = str_replace("'","´",  $kbez  );
                        //echo "<br> $kbez ";

                        $sql="UPDATE products  SET  customer_description='$kbez'  WHERE id =$pvs4_id ";
                        $ret_sql= mysqli_query( $con_pvs4, $sql );

                        if($ret_sql) {
                            echo " - ok id :$pvs4_id   " ;
                        }else{
                            echo "<br> -----> errror id4 : $pvs4_id id3 : $pvs3_id  <br> mysqli_error:".mysqli_error($con_pvs4); 
                            echo "<br> $sql <br>";
                            die;
                        }

                    }                    
                }
            }else{
                echo "<br> -----> errror pvs3_id : $pvs3_id      <br> mysqli_error:".mysqli_error($con_pvs3); 
                echo "<br> $sql <br>";
            }
           
            
        }

        echo "<br> ok ende ";
    }
}