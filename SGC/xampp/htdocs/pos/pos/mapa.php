<?php
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";

// salones
$result = mysql_query("select id_salon,nombre from salon",$conexion);
if (!isset($_SESSION['id_salon']))
{
$row = mysql_fetch_array($result);
$_SESSION['id_salon'] = $row['id_salon'];	
}
// mesas
$resultmesa = mysql_query("select * from mesa where id_salon = ".$_SESSION['id_salon']." or num_mesa = 0",$conexion);
while ($rowesa = mysql_fetch_array($resultmesa))
	{
	
	}
?>