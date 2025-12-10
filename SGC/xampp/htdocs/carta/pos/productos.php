<?php 
session_start();

include "./conn.php";



	$salida = "<h3>Productos</h3>";
	$padre = $_POST['padre'];
	$desde = $_POST['desde'];
		
		$sqlori = "";
		if ($_POST['padre'] == 'F')
			{
			$sqlori = $sqlori." and favorito = 'Y'";
			}
		else
			{
			$sqlori = $sqlori." and (id_tipo_comg = '".$_POST['padre']."' or id_complementog in (select id_complementog from tipo_comg_comg where id_tipo_comg = '".$_POST['padre']."'))";
			}

	
	if (isset($_SESSION['orderpro']))
		{
		if ($_SESSION['orderpro'] == '0')
			{
			$orderby = 'id_complementog';	
			}
		if ($_SESSION['orderpro'] == '1')
			{
			$orderby = 'complementog';	
			}
		if ($_SESSION['orderpro'] == '2')
			{
			$orderby = 'sort_order';	
			}
		}
	else
		{
		$orderby = 'id_complementog';	
		}
	
	
	$sql = "select * from complementog where venta='S' and cafeteria = 'S'";
	$sql = $sql.$sqlori;
	$sql = $sql." order by ".$orderby;
	
	$salida = $salida.'<table border="0">';
	$result = mysql_query($sql,$conexion);
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'';
		$salida = $salida.'<tr>';
		
			



		$salida = $salida.'<td width="33%">';
		$salida = $salida.'<a class="btncat" href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="ficha_producto(\''.$row['id_complementog'].'\');">';
		$salida = $salida.'<img src="./image.php?id='.$row['id_complementog'].'" width="188" align="left" />';
		
		$salida = $salida.'</a>';
		$salida = $salida.'</td>';	
			
		$salida = $salida.'<td valign="top"><a href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="ficha_producto(\''.$row['id_complementog'].'\');">';
		if ($row['alias'] != '')
			{
			if ($row['alias'] == ' ') { $row['alias'] = ''; }
			$salida = $salida.$row['alias'];
			}
		else
			{
			$salida = $salida.substr($row['complementog'],0,20);
			}	
		$salida = $salida.'</a><br/>'.substr($row['descripcion'],0,200);
		$salida = $salida.'</td>';	
		
		$salida = $salida.'</tr>';
		$salida = $salida.'';
		}
		
	$salida = $salida.'</table>';	
	echo $salida;



 