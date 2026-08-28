<?php
session_start();
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
$result = mysql_query("select * from camareros where clavecamarero = '".$_POST['passwd']."' and activo = 'S'",$conexion);
if (mysql_num_rows($result) > 0)
	{
	$row = mysql_fetch_array($result);
	$_SESSION['id_camarero'] = $row['id_camarero'];
	
	// privilegios
	$_SESSION['borrarlinea'] = $row['borrarlinea'];
	$_SESSION['modtiquet'] = $row['modtiquet'];
	$_SESSION['modtraspreticket'] = $row['modtraspreticket'];
	$_SESSION['finalizarventas'] = $row['finalizarventas'];
	
	$_SESSION['cancelartiquet'] = $row['cancelartiquet'];
	$_SESSION['preciomanual'] = $row['preciomanual'];
	$_SESSION['cambiartarifa'] = $row['cambiartarifa'];
	
	
	// imagenes
	$_SESSION['imagenes'] = $_POST['imagenes'];
	//$_SESSION['imagenes'] = 'N';
	


	
	
	echo "<script>carga('./menu.php','pagina');</script>";
	}
else
	{
	echo "<h3>".$txtloginerror."</h3><input type='button' data-icon='home' data-iconpos='left' value='".$txtback."' onclick='carga(\"./mobile.php\",\"pagina\");' />";
	}
?>