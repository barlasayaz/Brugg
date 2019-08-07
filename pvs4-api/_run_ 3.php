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

mysqli_query($con_pvs4,"SET NAMES 'utf8'");
mysqli_query($con_pvs4_pr,"SET NAMES 'utf8'");

$pvs4= mysqli_query($con_pvs4," SELECT id,id_number,customer,items,optimized FROM `products` WHERE  `optimized`=0 AND   `pvs3_id`>0 ORDER BY `pvs3_id` DESC LIMIT 3000; ");

if($pvs4){
    if(mysqli_num_rows($pvs4) > 0){
        while ($product = mysqli_fetch_assoc($pvs4)) {
            $product = utf8encodeArray($product);
            $new_items = array();
            $id = $product['id'];
            $nr = $product['id_number'];
            $customer = $product['customer'];
            $product['items']= str_replace("'","´",trim( $product['items'] ));
            $items = json_decode( $product['items'], true);
            if($items != true){
                echo "<br> ??? json_decode id : $id   nr: $nr  customer:$customer <br>" ; 
                $product['items']= str_replace("'","´",trim( $product['items'] ));
                $product['items']= str_replace('\\','',trim( $product['items'] ));
                $items = json_decode( $product['items'], true, 512 ,JSON_INVALID_UTF8_IGNORE);
                //print_r($test);  '
            } 
            if(sizeof($items)>0) {
                //echo 'v:<br>';
                //print_r($items);
                for($i= 0 ; $i < sizeof($items) ; $i++ ){      
                    if($items[$i]['id']==0) unset($items[$i]['id']);
                    unset($items[$i]['user']);
                    unset($items[$i]['licensee']);
                    array_push($new_items, $items[$i]);
                }
                //echo 'n:<br>';
                //print_r($new_items);
                $new_items_json = '[';
                for($i= 0 ; $i < sizeof($new_items) ; $i++ ){
                    if($i>0) $new_items_json .= ',';
                    $new_items_json .= json_encode( $new_items[$i] , JSON_UNESCAPED_UNICODE );
                }
                $new_items_json .= ']';
                //echo '<br>json:<br>'.$new_items_json ;
                
                $sql="  UPDATE products 
                        SET  items='$new_items_json', optimized=1 
                        WHERE id =$id ";
                $ret_sql= mysqli_query( $con_pvs4, $sql );
                if($ret_sql) {
                    echo " sql ok id : $id   nr: $nr  customer:$customer ! " ;
                }else{
                    echo "<br> -----> errror id : $id   nr: $nr  customer:$customer  <br> mysqli_error:".mysqli_error($con_pvs4); 
                    echo "<br> $sql <br>";
                    die;
                }
            }else{
                echo "<br> +++> errror sizeof() id : $id   nr: $nr  customer:$customer" ; 
            }            
            
        }
    }
}