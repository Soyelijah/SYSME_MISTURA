<?php
session_start();
include "./".$_SESSION['idioma'].".php";
if ($_SESSION['login'] == "S")
	{
	$password = "";	
	}
else
	{
	include "./conn.php";
	$result = mysql_query("select clavecamarero from camareros where id_camarero = '".$_POST['id_camarero']."'",$conexion);	
	$row = mysql_fetch_array($result);
	$password = $row['clavecamarero'];	
	}
?>
								<form id="accessform" action="#" method="POST">
	  
								<?php echo $txtemployeepasswd; ?>
								<br/>
								<input type="password" id="passwd" name="passwd" value="<?php echo $password; ?>" placeholder="<?php echo $txtemployeepasswd; ?>" size="20" value=""  />
			
								<br/><br/>
								<a class="btn" href="javascript:void(null);" onclick="login();"><?php echo $txtaccept; ?></a>
								
								</form>
								
<?php

if ($_SESSION['login'] == "S")
	{
	//
	}
else
	{
	echo "<script>login();</script>";
	}
?>