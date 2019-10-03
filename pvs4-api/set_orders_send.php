<?php
error_reporting(E_ERROR);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

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
			processing();
			die;
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
    $con=mysqli_connect($database_location,$database_username,$database_password,$database_name);
    mysqli_query($con,"SET NAMES 'utf8'");
    if (mysqli_connect_errno()){
        http_response_code(500);
        $error = new \stdClass();
        $error->message = "Failed to connect to MySQL: ".mysqli_connect_error();
        //$error->sql = $sql;
        $error->error = 1;
        echo json_encode($error);
        die;
    }

    // verify Brugg ID and token ------------------------
    $_POST['bruggid'] =  trim( mysqli_escape_string($con,$_POST['bruggid']));
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
        $error->error = 2;
        $error->oauth2 = $response->body;
        echo json_encode($error);
        die;
    }
    
    // ---------------------------------------------------------------------------------------------- //  
    function upload_file($encoded_string, $pvs_order_nr){
        $target_dir = '../attachments/orders/'; // add the specific path to save the file
        $decoded_file = base64_decode($encoded_string); // decode the file
        $mime_type = finfo_buffer(finfo_open(), $decoded_file, FILEINFO_MIME_TYPE); // extract mime type
        $extension = mime2ext($mime_type); // extract extension from mime type
        $file = 'Bestellung_' . $pvs_order_nr . '.' . $extension; // rename file as a unique name
        $file_dir = $target_dir . 'Bestellung_' . $pvs_order_nr. '.' . $extension;
        try {
            file_put_contents($file_dir, $decoded_file); // save
            //header('Content-Type: application/json');
            //echo json_encode("File Uploaded Successfully");
            return $file_dir;
        } catch (Exception $e) {
            http_response_code(500);
            $error = new \stdClass();
            $error->message = $e->getMessage();
            $error->info = "upload";
            $error->error = 3;
            $error->oauth2 = $response->body;
            echo json_encode($error);
            die;
        }
    }
    
    // to take mime type as a parameter and return the equivalent extension
    
    function mime2ext($mime){ $all_mimes = '{"png":["image\/png","image\/x-png"],"bmp":["image\/bmp","image\/x-bmp",
                                "image\/x-bitmap","image\/x-xbitmap","image\/x-win-bitmap","image\/x-windows-bmp",
                                "image\/ms-bmp","image\/x-ms-bmp","application\/bmp","application\/x-bmp",
                                "application\/x-win-bitmap"],"gif":["image\/gif"],"jpeg":["image\/jpeg",
                                "image\/pjpeg"],"xspf":["application\/xspf+xml"],"vlc":["application\/videolan"],
                                "wmv":["video\/x-ms-wmv","video\/x-ms-asf"],"au":["audio\/x-au"],
                                "ac3":["audio\/ac3"],"flac":["audio\/x-flac"],"ogg":["audio\/ogg",
                                "video\/ogg","application\/ogg"],"kmz":["application\/vnd.google-earth.kmz"],
                                "kml":["application\/vnd.google-earth.kml+xml"],"rtx":["text\/richtext"],
                                "rtf":["text\/rtf"],"jar":["application\/java-archive","application\/x-java-application",
                                "application\/x-jar"],"zip":["application\/x-zip","application\/zip",
                                "application\/x-zip-compressed","application\/s-compressed","multipart\/x-zip"],
                                "7zip":["application\/x-compressed"],"xml":["application\/xml","text\/xml"],
                                "svg":["image\/svg+xml"],"3g2":["video\/3gpp2"],"3gp":["video\/3gp","video\/3gpp"],
                                "mp4":["video\/mp4"],"m4a":["audio\/x-m4a"],"f4v":["video\/x-f4v"],"flv":["video\/x-flv"],
                                "webm":["video\/webm"],"aac":["audio\/x-acc"],"m4u":["application\/vnd.mpegurl"],
                                "pdf":["application\/pdf","application\/octet-stream"],
                                "pptx":["application\/vnd.openxmlformats-officedocument.presentationml.presentation"],
                                "ppt":["application\/powerpoint","application\/vnd.ms-powerpoint","application\/vnd.ms-office",
                                "application\/msword"],"docx":["application\/vnd.openxmlformats-officedocument.wordprocessingml.document"],
                                "xlsx":["application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application\/vnd.ms-excel"],
                                "xl":["application\/excel"],"xls":["application\/msexcel","application\/x-msexcel","application\/x-ms-excel",
                                "application\/x-excel","application\/x-dos_ms_excel","application\/xls","application\/x-xls"],
                                "xsl":["text\/xsl"],"mpeg":["video\/mpeg"],"mov":["video\/quicktime"],"avi":["video\/x-msvideo",
                                "video\/msvideo","video\/avi","application\/x-troff-msvideo"],"movie":["video\/x-sgi-movie"],
                                "log":["text\/x-log"],"txt":["text\/plain"],"css":["text\/css"],"html":["text\/html"],
                                "wav":["audio\/x-wav","audio\/wave","audio\/wav"],"xhtml":["application\/xhtml+xml"],
                                "tar":["application\/x-tar"],"tgz":["application\/x-gzip-compressed"],"psd":["application\/x-photoshop",
                                "image\/vnd.adobe.photoshop"],"exe":["application\/x-msdownload"],"js":["application\/x-javascript"],
                                "mp3":["audio\/mpeg","audio\/mpg","audio\/mpeg3","audio\/mp3"],"rar":["application\/x-rar","application\/rar",
                                "application\/x-rar-compressed"],"gzip":["application\/x-gzip"],"hqx":["application\/mac-binhex40",
                                "application\/mac-binhex","application\/x-binhex40","application\/x-mac-binhex40"],
                                "cpt":["application\/mac-compactpro"],"bin":["application\/macbinary","application\/mac-binary",
                                "application\/x-binary","application\/x-macbinary"],"oda":["application\/oda"],
                                "ai":["application\/postscript"],"smil":["application\/smil"],"mif":["application\/vnd.mif"],
                                "wbxml":["application\/wbxml"],"wmlc":["application\/wmlc"],"dcr":["application\/x-director"],
                                "dvi":["application\/x-dvi"],"gtar":["application\/x-gtar"],"php":["application\/x-httpd-php",
                                "application\/php","application\/x-php","text\/php","text\/x-php","application\/x-httpd-php-source"],
                                "swf":["application\/x-shockwave-flash"],"sit":["application\/x-stuffit"],"z":["application\/x-compress"],
                                "mid":["audio\/midi"],"aif":["audio\/x-aiff","audio\/aiff"],"ram":["audio\/x-pn-realaudio"],
                                "rpm":["audio\/x-pn-realaudio-plugin"],"ra":["audio\/x-realaudio"],"rv":["video\/vnd.rn-realvideo"],
                                "jp2":["image\/jp2","video\/mj2","image\/jpx","image\/jpm"],"tiff":["image\/tiff"],
                                "eml":["message\/rfc822"],"pem":["application\/x-x509-user-cert","application\/x-pem-file"],
                                "p10":["application\/x-pkcs10","application\/pkcs10"],"p12":["application\/x-pkcs12"],
                                "p7a":["application\/x-pkcs7-signature"],"p7c":["application\/pkcs7-mime","application\/x-pkcs7-mime"],"p7r":["application\/x-pkcs7-certreqresp"],"p7s":["application\/pkcs7-signature"],"crt":["application\/x-x509-ca-cert","application\/pkix-cert"],"crl":["application\/pkix-crl","application\/pkcs-crl"],"pgp":["application\/pgp"],"gpg":["application\/gpg-keys"],"rsa":["application\/x-pkcs7"],"ics":["text\/calendar"],"zsh":["text\/x-scriptzsh"],"cdr":["application\/cdr","application\/coreldraw","application\/x-cdr","application\/x-coreldraw","image\/cdr","image\/x-cdr","zz-application\/zz-winassoc-cdr"],"wma":["audio\/x-ms-wma"],"vcf":["text\/x-vcard"],"srt":["text\/srt"],"vtt":["text\/vtt"],"ico":["image\/x-icon","image\/x-ico","image\/vnd.microsoft.icon"],"csv":["text\/x-comma-separated-values","text\/comma-separated-values","application\/vnd.msexcel"],"json":["application\/json","text\/json"]}';
        $all_mimes = json_decode($all_mimes,true);
        foreach ($all_mimes as $key => $value) {
            if(array_search($mime,$value) !== false) return $key;
        }
        return false;
    }

    // invoke upload_file function and pass your input as a parameter
    $encoded_string = !empty($_POST['pdfBase64']) ? $_POST['pdfBase64'] : 'V2ViZWFzeXN0ZXAgOik=';

    // ---------------------------------------------------------------------------------------------- //
    
    $status = 0;
    $text ="";    
    $_POST['Empfaenger']=   trim( mysqli_escape_string($con,$_POST['Empfaenger']));
    $_POST['Copy']=   trim( mysqli_escape_string($con,$_POST['Copy']));
    $pvs_order_nr = 0;
    if(isset($_POST['pvs_order_nr']) ) { $pvs_order_nr = intval($_POST['pvs_order_nr']); }
    if($pvs_order_nr<= 0) $pvs_order_nr=uniqid();

    global $mail;  
          
    $fileattach = upload_file($encoded_string, $pvs_order_nr);

    $mail->CharSet = "utf-8";
    $mail->IsSendmail();
    $mail->AddAddress($_POST['Empfaenger']);
    $mail->AddBcc( "info@it-services-aydin.de");
    $mail->AddCC($_POST['Copy']); 
    $mail->SetFrom('info@pvs2go.com');
    $mail->AddReplyTo('info@pvs2go.com');

    $mail->AddAttachment($fileattach);  // Attachment
    $mail->Subject = $_POST['Betreff']." - ".$pvs_order_nr;
    $mail->AltBody = 'To view the message, please use an HTML compatible email viewer!'; // optional - MsgHTML will create an alternate automatically
    
    $meinText = "<strong>www.pvs2go.com - Bestellformular</strong><br><br>";
    if($_POST['Type'] == 1){
        $meinText.= '<p>Beauftragt vom Brugg-Mitarbeiter: '.$_POST['UserName'].', '.$_POST['UserVorname'].' ('.$_POST['UserEmail'].')</p>';
    }else{
        $meinText.= '<p>Beauftragt vom Kunde: '.$_POST['UserName'].', '.$_POST['UserVorname'].' ('.$_POST['UserEmail'].')</p>';
    }
    $mail->MsgHTML($meinText);

    $versand = $mail->Send();
    if(!$versand)
    {
        //$text = "  The message could not be sent!  ".htmlentities($mail->ErrorInfo);
        $status = -1; //err
        hhttp_response_code(500);
        $error = new \stdClass();
        $error->message = $mail->ErrorInfo;
        $error->info = "send";
        $error->error = 5;
        $error->status = $status;
        echo json_encode($error);
        die;
    }else {
        //$text =  " The message has been successfully sent. ";
        $status = 1; //ok
        http_response_code(200);
        $ok = new \stdClass();
        $ok->amount = 1;
        $ok->status = $status;
        echo json_encode($ok);
        mysqli_close($con);
        die;
    }
}