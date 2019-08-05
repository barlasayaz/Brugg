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

$pvs4_pr= mysqli_query($con_pvs4_pr,"SELECT * FROM `protocols` WHERE  `optimized`=0 AND  `pvs3_id`>0 ORDER BY `pvs3_id` DESC LIMIT 14000; ");


if($pvs4_pr){
    if(mysqli_num_rows($pvs4_pr) > 0){
        while ($pruef = mysqli_fetch_assoc($pvs4_pr)) {
            $pruef = utf8encodeArray($pruef);
            $new_items = array();
            $id = $pruef['id'];
            $nr = $pruef['protocol_number'];
            $customer = $pruef['customer'];
            $pruef['items']= str_replace('Cordino ,Etichetta, " congiuntori 10242',"Cordino ,Etichetta, congiuntori 10242",trim( $pruef['items'] ));
            $items = json_decode( $pruef['items'], true);
            if($items != true){
                echo "<br> ??? json_decode id : $id    customer:$customer <br>" ; 
                $pruef['items']= str_replace("'","´",trim( $pruef['items'] ));
                $pruef['items']= str_replace('\\','',trim( $pruef['items'] ));
                $items = json_decode( $pruef['items'], true, 512 ,JSON_INVALID_UTF8_IGNORE);
                //print_r($test);  '
            } 
            //echo '<br><br>';
            if(sizeof($items)>0) {
                //echo 'v:<br>';
                //print_r($items);
                for($i= 0 ; $i < sizeof($items) ; $i++ ){
                    //echo '$i:'.$i;           
                    if(strcmp($items[$i]['title']['en'], 'Test load (kg)')==0){
                        if(strcmp($items[$i]['value'], '')==0){
                            //echo "<br> Prüflast -del <br>";
                            //print_r($items[$i]);
                            //unset($items[$i]);
                            continue;
                        }
                    }
                    if(strcmp($items[$i]['title']['en'], 'Test measurements')==0){
                        if(strcmp($items[$i]['value'], 'Soll: mm  Ist: mm')==0){
                            //echo ' Prüfmasse -del <br>';
                            //unset($items[$i]);
                            continue;
                        }
                    }

                    unset($items[$i]['active']);
                    unset($items[$i]['options']);
                    unset($items[$i]['mandatory']);
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
                
                $sql="  UPDATE protocols 
                        SET  items='$new_items_json', optimized=1 
                        WHERE id =$id ";
                $ret_sql= mysqli_query( $con_pvs4_pr, $sql );

                if($ret_sql) {
                    echo " ok id:$id nr:$nr customer:$customer ! " ;
                }else{
                    echo "<br> -----> errror id : $id   nr: $nr  customer:$customer  <br> mysqli_error:".mysqli_error($con_pvs4_pr); 
                    echo "<br> $sql <br>";
                    die;
                }
            }else{
                echo "<br> +++> errror sizeof() id : $id   nr: $nr  customer:$customer" ; 
            }
            
            
        }

        /*
        $sql="  OPTIMIZE TABLE `protocols`  ";
        $ret_sql= mysqli_query( $con_pvs4_pr, $sql );

        if($ret_sql) {
            echo " ok OPTIMIZE  ! " ;
        }else{
            echo "<br> -----> OPTIMIZE <br> mysqli_error:".mysqli_error($con_pvs4_pr); 
            echo "<br> $sql <br>";
            die;
        }
        

        $sql="  SELECT table_schema, sum( data_length + index_length ) / 1024 / 1024 'Database Size in MB' FROM information_schema.TABLES ";
        $ret_sql= mysqli_query( $con_pvs4_pr, $sql );

        if($ret_sql) {
            echo " ok size  ! " ;
            $mb = mysqli_fetch_assoc($ret_sql);
            print_r($mb);
        }else{
            echo "<br> -----> SIZE_MB <br> mysqli_error:".mysqli_error($con_pvs4_pr); 
            echo "<br> $sql <br>";
            die;
        }
        */


        


    }
}