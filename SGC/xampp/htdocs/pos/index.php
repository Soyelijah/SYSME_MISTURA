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
// obten la ip
$ip = $_SERVER['SERVER_ADDR']; 
//$ip = getServerAddress();
// incluye phpqrcode
include "./phpqrcode.php";
// genera codigo qr
QRcode::png('http://'.$ip.':4406/pos/pos/', 'link.png', 'H', 4, 2);

// idioma
$file = fopen ("../language.txt", "r");
$content = fread($file, filesize("../language.txt"));
$idioma = trim($content," \t\n\r\0\x0B");
if ($idioma == 'es')
	{
	$txtappname = "Sysme Tpv Mobile";
	$txtstatus = "Sysme Tpv Mobile est&aacute; iniciado y funcionando en este equipo.";
	$txtconnectyourdevice = "Conectar tu dispositivo";
	$txtconnectdesc = "El dispositivo debe estar conectado a la red local de este equipo mediante Wi-Fi. Para conectar a Sysme Tpv Mobile desde tu dispositivo tienes las siguientes opciones:";
	$txtandroiddesc = "<a href='https://play.google.com/store/apps/details?id=com.sysme.sysmetpv'>Descarga Sysme Tpv Mobile desde Google Play</a> y conecta la aplicaci&oacute;n a la direcci&oacute;n IP ";
	$txtotherdesc1 = "Abre el navegador de Internet del dispositivo y navega a la siguiente URL: ";
	$txtotherdesc2 = " o bien escanea el siguiente c&oacute;digo QR:";
	
	$txtotros = "Otros";
	}
else
	{
	$txtappname = "Sysme Pos Mobile";
	$txtstatus = "Sysme Pos Mobile is started and running in this computer.";
	$txtconnectyourdevice = "Connect your device";	
	$txtconnectdesc = "The device must be connected to the local network of this computer via Wi-Fi. To connect to Sysme Pos Mobile from your device have the following options:";
	$txtandroiddesc = "<a href='https://play.google.com/store/apps/details?id=com.sysme.sysmetpv'>Download Sysme Pos Mobile from Google Play</a> and connect the application to the IP address ";
	$txtotros = "Other";
	$txtotherdesc1 = "Open the device's Internet browser and navigate to the following URL: ";
	$txtotherdesc2 = " or scan the QR code:";
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
	<h2>
		1 - Android
	</h2>
	<p>
		<?php echo $txtandroiddesc; ?><?php echo $ip; ?>
	</p>
	<h2>
		2 - <?php echo $txtotros; ?> (IOS, Windows ...)
	</h2>	
	</p>
		<?php echo $txtotherdesc1; ?> <a href="http://<?php echo $ip; ?>:4406/pos/pos/">http://<?php echo $ip; ?>:4406/pos/pos/</a> <?php echo $txtotherdesc2; ?>
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