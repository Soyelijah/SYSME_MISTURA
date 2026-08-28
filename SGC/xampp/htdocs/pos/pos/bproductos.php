<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";



	$salida = "";
	$criterio = $_POST['criterio'];
		
	$sqlori = "";
	$sqlori = $sqlori." and (complementog like '%".$_POST['criterio']."%' or codbarras = '%".$_POST['criterio']."%')";
		
	


	

	$sql = "select * from complementog where venta='S' and cafeteria = 'S'";
	$sql = $sql.$sqlori;
	$sql = $sql." order by complementog";
	
	$result = mysql_query($sql,$conexion);
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'';
		$salida = $salida.'<div class="botonpro">';
		
		$cuentacombinados = 0;
		$result2 = mysql_query('select * from combinados where id_complementog = "'.$row['id_complementog'].'"',$conexion);
		$cuentacombinados = mysql_num_rows($result2);
		
		//if ($row['solicitaopciones'] == 'S')
		if (($row['solicitaopciones'] == 'S') or ($cuentacombinados > 0) or ($row['precio'] == 0) )
			{
			$salida = $salida.'<a class="btncat" href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="ficha_producto(\''.$row['id_complementog'].'\');">';
			}
		else
			{
			$salida = $salida.'<a class="btncat" href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="plusone(\''.$row['id_complementog'].'\');">';
			}		
		if ($row['alias'] != '')
			{
			$salida = $salida.$row['alias'];
			}
		else
			{
			//$salida = $salida.$row['complementog'];
			$salida = $salida.substr($row['complementog'],0,20);
			}		
			$salida = $salida.'<img src="./image.php?id='.$row['id_complementog'].'" width="100%" height="60" /></a>';
			$salida = $salida.'<script>';
			$salida = $salida.' if ( $("#imgproducto-'.$row['id_complementog'].'").length > 0 ) {';
			$salida = $salida.'$("#imgproducto-'.$row['id_complementog'].'").appendTo("#link2'.$row['id_complementog'].'"); } else { createimage("P","link2'.$row['id_complementog'].'","'.$row['id_complementog'].'"); }';
			$salida = $salida.'</script>';	

		$salida = $salida.'<div id="link'.$row['id_complementog'].'" class="procuenta"></div>';
		$salida = $salida.'<div id="linkcocina'.$row['id_complementog'].'" class="procuenta2"></div>';
		$salida = $salida.'</div>';
		$salida = $salida.'';
		}
		

		
	echo $salida;



 