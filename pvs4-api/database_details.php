<?php

if(strcmp ($_SERVER['SERVER_NAME'], 'localhost')==0){
    $database_name = 'brugg4';
    $database_location = 'localhost';
    $database_username = 'root';
    $database_password = '';

    $database_name_2 = 'brugg4';
    $database_location_2 = 'localhost';
    $database_username_2 = 'root';
    $database_password_2 = '';

    //$brugg_id_api   = 'http://localhost/brugg-id/';
    $brugg_id_api   = 'https://bruggdigital.com/';
    $file_link      = 'http://localhost/BruggPVS4/attachments/';
    $baan_link1     = 'http://localhost/BruggPVS4/baan_pdf/';
    $baan_link2     = 'http://localhost/BruggPVS4/baan_pdf_2/';    
}else{
    $database_name      = 'db759837994';
    $database_location  = 'db759837994.hosting-data.io';
    $database_username  = 'dbo759837994';
    $database_password  = 'Sd-PVS4-DB';

    $database_name_2     = 'dbs126376';
    $database_location_2  = 'db5000131609.hosting-data.io';
    $database_username_2  = 'dbu44763';
    $database_password_2  = 'Sd-PVS4-DB';

    $brugg_id_api   = 'https://bruggdigital.com/';
    $file_link      = 'https://www.pvs2go.com/attachments/';
    $baan_link1     = 'https://www.pvs2go.com/baan_pdf/';
    $baan_link2     = 'https://www.pvs2go.com/baan_pdf_2/';
}

$file_dir = '../attachments/';
$baan_dir1 = '../baan_pdf/';
$baan_dir2 = '../baan_pdf_2/';

if (!function_exists('utf8encodeArray')){
    function utf8encodeArray($array)
    {
            foreach($array as $key =>  $value)
            {
                if(is_array($value))
                {
                    $array[$key] = utf8encodeArray($value);
                }
                elseif(!mb_detect_encoding($value, 'UTF-8', true))
                {
                    $array[$key] = utf8_encode($value);
                }
            } 
            return $array;
    }
}