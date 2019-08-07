<?php
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

require_once 'database_details.php';

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
if(!isset($_GET['k'])) die;
$k = trim( mysqli_escape_string($con, $_GET['k'] ) ) ;
//echo $k;
if(strcmp($k,'j4jf5u!jsGH-uhfze')!=0 ) die;
$currentDate = date("Y-m-d");
$sql    = "SELECT id FROM `customer` WHERE `active` = 1  AND `days_review` < '$currentDate' ORDER BY  `days_review`  ;";
//echo $sql;
//$sql    = "SELECT id,last_protocol,check_interval FROM `products` WHERE `active` = 1 AND `inspection_service`=1 ;";
$ret_cust= mysqli_query( $con, $sql );
if($ret_cust) {
    $anz_cust = mysqli_num_rows($ret_cust);
    echo "anz_cust:".$anz_cust."<br>";
    if($anz_cust > 0){
        $anz = 0;
        while ($customer = mysqli_fetch_assoc($ret_cust)) {
            $anz++;
            if($anz>5000) break;
            $id   = intval($customer['id'] );
            //echo "anz:$anz  id:$id<br>";
            $sql  = "SELECT id,last_protocol,check_interval FROM `products` WHERE `active` = 1 AND `inspection_service`=1 AND `customer` = $id;";
            $ret_sql= mysqli_query( $con, $sql );
            $days10 = 0;
            $days30 = 0;
            $days90 = 0;
            if($ret_sql) {
                if(mysqli_num_rows($ret_sql) > 0){
                    while ($row = mysqli_fetch_assoc($ret_sql)) {
                        $product = utf8encodeArray($row);
                        $pid = $row['id'];
                        if( $row['last_protocol'] )  {
                            $last_pr = json_decode( $row['last_protocol'], true, 512 ,JSON_INVALID_UTF8_IGNORE);
                            $result   = intval($last_pr['result'] );

                            $PR_next_time = strtotime($last_pr['protocol_date']);
                            if( $row['check_interval']>0) $PR_next_time += $row['check_interval'] * (60*60*24*30.4);
                            else $PR_next_time += 12 * (60*60*24*30.4); 
                                
                            //echo $PR_next_time."<br>";
                            $diffTime = $PR_next_time - time();
                            if( $diffTime <= (60*60*24*10)){
                                $days10++;
                            } else if( $diffTime <= (60*60*24*30)){
                                $days30++;
                            } else if( $diffTime < (60*60*24*90)){
                                $days90++;
                            }
                        }              
                    }
                }

                $days= json_encode (array( "days10" => $days10,"days30" => $days30,"days90" => $days90) );
                $days_review = date("Y-m-d", time() ) ;

                //echo $days."<br>".$days_review ;
                $sql="UPDATE customer  SET  `days` ='$days', `days_review` = '$days_review' WHERE id =$id";
                $ret_sql= mysqli_query( $con, $sql );

                if($ret_sql) {
                    //ok
                    //echo "anz:$anz  id:$id  days:$days  days_review:$days_review<br>";
                }else{
                    // return 500 problem with query.
                    http_response_code(500);
                    $error = new \stdClass();
                    $error->message = 'Internal Server Error 1';
                    echo json_encode($error);
                    mysqli_close($con);
                    die;
                }
            }else{
                // return 500 problem with query.
                http_response_code(500);
                $error = new \stdClass();
                $error->message = 'Internal Server Error 2';
                echo json_encode($error);
                mysqli_close($con);
                die;
            }
        }

        echo 'job ok';
    }
}else{
    // return 500 problem with query.
    http_response_code(500);
    $error = new \stdClass();
    $error->message = 'Internal Server Error 3';
    echo json_encode($error);
    mysqli_close($con);
    die;
}
