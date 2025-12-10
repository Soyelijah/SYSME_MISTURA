<?php 
function getServerAddress() {
if(array_key_exists('SERVER_ADDR', $_SERVER))
    return $_SERVER['SERVER_ADDR'];
elseif(array_key_exists('LOCAL_ADDR', $_SERVER))
    return $_SERVER['LOCAL_ADDR'];
elseif(array_key_exists('SERVER_NAME', $_SERVER))
    return gethostbyname($_SERVER['SERVER_NAME']);
else {
    // Running CLI
    if(stristr(PHP_OS, 'WIN')) {
        return gethostbyname(php_uname("n"));
    } else {
        $ifconfig = shell_exec('/sbin/ifconfig eth0');
        preg_match('/addr:([\d\.]+)/', $ifconfig, $match);
        return $match[1];
    }
}
}

function getServerAddress2() {

    // Running CLI
    if(stristr(PHP_OS, 'WIN')) {
        return gethostbyname(php_uname("n"));
    } else {
        $ifconfig = shell_exec('/sbin/ifconfig eth0');
        preg_match('/addr:([\d\.]+)/', $ifconfig, $match);
        return $match[1];
    }
}
// obten la ip
$ip = $_SERVER['SERVER_ADDR']; 
$ip = getServerAddress2();
// incluye phpqrcode
include "./phpqrcode.php";
// genera codigo qr
QRcode::png('http://'.$ip.':4406/carta/pos/', 'link.png', 'H', 4, 2);

// idioma
$file = fopen ("../language.txt", "r");
$content = fread($file, filesize("../language.txt"));
$idioma = trim($content," \t\n\r\0\x0B");
if ($idioma == 'es')
	{
	$txtappname = "Carta Móvil";
	$txtstatus = "Carta Móvil est&aacute; iniciado y funcionando en este equipo.";
	$txtconnectyourdevice = "Acceso de clientes";
	$txtconnectdesc = "De acceso a su red WiFi a sus clientes e imprima el siguiente código QR para que puedan ver la carta:";
	$txtandroiddesc = "";
	$txtotherdesc1 = "";
	$txtotherdesc2 = "";
	
	$txtotros = "";
	}
else
	{
	$txtappname = "Carta Móvil";
	$txtstatus = "Carta Móvil est&aacute; iniciado y funcionando en este equipo.";
	$txtconnectyourdevice = "Acceso de clientes";
	$txtconnectdesc = "De acceso a su red WiFi a sus clientes e imprima el siguiente código QR para que puedan ver la carta:";
	$txtandroiddesc = "";
	$txtotherdesc1 = "";
	$txtotherdesc2 = "";
	
	$txtotros = "";
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> 
<title><?php echo $txtappname; ?></title> 
<link rel="stylesheet" type="text/css" href="./css/preview.css" /> 
</head> 
 
<body> 
<div class="preview_container"> 
 
 

<div class="nav"> 
	<h2>
		<?php echo $txtappname; ?>
	</h2>
	<p>
		<?php echo $txtstatus; ?>
	</p>
	
	<h2>
		<?php echo $txtconnectyourdevice; ?>
	</h2>
	<p>
		<?php echo $txtconnectdesc; ?> 
	</p>

	<p><img src="./link.png" /></p>
	
</div> 
  
 
<div class="iphone_container"> 
 
    <div class="preview_content"> 
    <iframe id="datamain" src="./pos/" width=480 height=800 marginwidth=0 marginheight=0 hspace=0 vspace=0 frameborder=1 style="border:none;"></iframe> 
    </div> 
    
</div> 
 
</div> 
 
 
</body> 
</html> 