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
        if(isset($_POST['user']) ) {
            processing( $_POST['user'] );
        }else{
            http_response_code(500);
            $error = new \stdClass();
            $error->message = 'Internal Server Error: 1';
            echo json_encode($error);            
        }
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

function processing($user) {
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
    if( !isset( $_POST['bruggid'] ) || !isset( $_POST['token'] ) ){
        http_response_code($response->code);
        $error = new \stdClass();
        $error->message = 'not verified';
        $error->error = 5;
        $error->oauth2 = $response->body;
        echo json_encode($error);
        die;
    }
    $_POST['bruggid'] =  trim( mysqli_escape_string($con,$_POST['bruggid']));
    $email = $_POST['bruggid'];
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
    
    $user   = trim( mysqli_escape_string($con,$user) );
    $licensee = 0;
    $offset = 0;
    $role = 0;
    $customerName = '';
    if(isset($_POST['licensee'])) $licensee = intval ( trim( mysqli_escape_string($con,$_POST['licensee']) ));
    if(isset($_POST['offset'])) $offset = intval ( trim( mysqli_escape_string($con,$_POST['offset']) ));
    if(isset($_POST['role'])) $role = intval ( trim( mysqli_escape_string($con,$_POST['role']) ));
    if(isset($_POST['customerName'])) $customerName = trim(mysqli_escape_string($con,$_POST['customerName']));
    $limit  = 9999;
    $offset = $offset * $limit ;
    if(($role==1)||($role==2)){
        /*
        $sql = "SELECT cr.*, 
                       concat(ps_emp.first_name,' ', ps_emp.last_name) as employees,
                       concat(ps_tst.first_name,' ', ps_tst.last_name) as inspector,
                       (SELECT appointment_date
                          FROM `appointment`
                         WHERE `appointment_date` < NOW() 
                           AND `idCustomer` = cr.id 
                           AND `appointment_type` = 0 
                           AND `active` = 1 
                      ORDER by appointment_date DESC LIMIT 1) as last_date,
                       (SELECT appointment_date
                          FROM `appointment`
                         WHERE `appointment_date` >= NOW() 
                           AND `idCustomer` = cr.id 
                           AND `appointment_type` = 0 
                           AND `active` = 1 
                      ORDER by appointment_date ASC LIMIT 1) as next_date
                  FROM `customer` as cr
                       LEFT JOIN profiles as ps_emp ON ps_emp.id = cr.sales
                       LEFT JOIN profiles as ps_tst ON ps_tst.id = cr.tester
                 WHERE cr.active = 1 
                   AND cr.licensee = $licensee
              ORDER BY cr.parent LIMIT $limit OFFSET $offset;";
              */

              /*
              $sql = "SELECT cr.*
                            FROM `customer` as cr
                            WHERE cr.active = 1 
                            AND cr.licensee = $licensee
                      ORDER BY cr.parent LIMIT $limit OFFSET $offset;";
            
                      */     
                      
            $sql = "SELECT cr.*, 
                      concat(ps_emp.first_name,' ', ps_emp.last_name) as employees,
                      concat(ps_tst.first_name,' ', ps_tst.last_name) as inspector                  
                 FROM `customer` as cr
                      LEFT JOIN profiles as ps_emp ON ps_emp.id = cr.sales
                      LEFT JOIN profiles as ps_tst ON ps_tst.id = cr.tester
                WHERE cr.active = 1 
                  AND cr.licensee = $licensee
                  AND cr.company LIKE '$customerName%'
             ORDER BY cr.parent LIMIT $limit OFFSET $offset;";                               
    }else{
        $cp= mysqli_query($con,"SELECT * FROM contact_persons WHERE active = 1 AND email = '$email'");
        if($cp) {
            $customer_all = mysqli_fetch_all($cp, MYSQLI_ASSOC);
            $arr= array(0);
            foreach ($customer_all as $value) {
                $arr[] = $value['customer'];
            }
            // $sql = "SELECT * FROM `customer` WHERE (`active` = 1) AND (`id` IN (".implode(',',$arr)."))";
            $sql = "SELECT cr.*, 
                           concat(ps_emp.first_name,' ', ps_emp.last_name) as employees,
                           concat(ps_tst.first_name,' ', ps_tst.last_name) as inspector 
                      FROM `customer` as cr
                           LEFT JOIN profiles as ps_emp ON ps_emp.id = cr.sales
                           LEFT JOIN profiles as ps_tst ON ps_tst.id = cr.tester
                     WHERE cr.active = 1
                       AND cr.company LIKE '$customerName%'
                       AND cr.id IN (".implode(',',$arr).")";
        }
    }

    $ret_sql= mysqli_query( $con, $sql );

    $liste = [];
    $anz_liste = 0;
    if($ret_sql) {
        // OK
        function recu_find_parent(&$arr, $child){
            foreach ($arr as &$value) {
                if($value['data']['id']==$child['parent']){
                    if(isset($value['children'])){
                        $value['children'][] = array('data' => $child);
                    }else{
                        $value['children'] = array();
                        $value['children'][] = array('data' => $child); 
                    }
                    return 1;
                }else{
                    if(isset($value['children'])){
                        recu_find_parent($value['children'], $child); 
                    }
                }   
            }
            return 0;
        }
        while ($row = mysqli_fetch_assoc($ret_sql)) {
            if( strlen($row['sales_dates'])>3){
                $x = json_decode($row['sales_dates'], true);
                //print_r($x);
                if (strpos($x['last_date'], '.') != false) {
                    $st = explode('.',$x['last_date']);
                    $row['last_date'] = $st[2].'-'.$st[1].'-'.$st[0];
                }else{
                    $row['last_date'] = "";
                }
                if (strpos($x['next_date'], '.') != false) {
                    $st = explode('.',$x['next_date']);
                    $row['next_date'] = $st[2].'-'.$st[1].'-'.$st[0];
                }else{
                    $row['next_date'] = "";
                }
            }
            if($row['parent']==0){
                $liste[] = array('data' => $row);
            }else{
                recu_find_parent($liste, $row);
            }            
            $anz_liste++;
        }

  //print_r($liste);
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = $anz_liste;
        $ok->list = $liste;
        //$ok->sql = $sql;
        echo json_encode($ok);
        mysqli_close($con);
        die;
    }else{
        // return 500 problem with query.
        http_response_code(500);
        $error = new \stdClass();
        $error->amount = 0; 
        $error->message = 'Internal Server Error';
        $error->sql = $sql;
        echo json_encode($error);
        mysqli_close($con);
        die;
    }
 
}
// here you could write functions to update an existing contact or delete a contact. 
// any information posted from you Ionic app would be in the object $_POST