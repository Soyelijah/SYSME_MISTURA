<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";



	$salida = "";
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
	
	// cuenta productos
	$sql = "select count(*) as cuenta from complementog where venta='S' and cafeteria = 'S'".$sqlori;
	$result = mysql_query($sql,$conexion);
	$row = mysql_fetch_array($result);
	$cuenta = $row['cuenta'];
	

	
	// SI QUEREMOS 5 LINEAS DE PRODUCTOS
	if ($desde > 0)
	{
	if ($desde + 23 > $cuenta)
		{
		$hasta = 24;
		} 
	else
		{
		$hasta = 23;
		}
	}
	else
	{
	if ($desde + 24 > $cuenta)
		{
		$hasta = 25;
		} 
	else
		{
		$hasta = 24;
		} 		
	}
	
	// SI QUEREMOS 5 LINEAS DE PRODUCTOS
	if ($desde > 0)
	{
	if ($desde + 14 > $cuenta)
		{
		$hasta = 15;
		} 
	else
		{
		$hasta = 14;
		}
	}
	else
	{
	if ($desde + 15 > $cuenta)
		{
		$hasta = 16;
		} 
	else
		{
		$hasta = 15;
		} 		
	}
	

	


//echo $desde."-".$hasta;

	// volver atras
	if ($desde > 0)
		{
		$valor = $desde - $hasta - 1;
		if ($valor < 0) { $valor = 0; }
		$salida = $salida.'<div class="botonpro"><a class="btncat" href=javascript:void(null);" onclick="showproductos(\''.$_POST['padre'].'\','.$valor.');">';
		$salida = $salida.' <span class="btncat">Volver</span><br/><img src="./images/volver.jpg" width="100%" height="100%" /></a></div>';
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
	$sql = $sql." order by ".$orderby." limit ".$desde.",".$hasta;
	
	$result = mysql_query($sql,$conexion);
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'';
		$salida = $salida.'<div class="botonpro">';
		
		$cuentacombinados = 0;
		$result2 = mysql_query('select * from combinados where id_complementog = "'.$row['id_complementog'].'"',$conexion);
		$cuentacombinados = mysql_num_rows($result2);
		
		if (($row['solicitaopciones'] == 'S') or ($cuentacombinados > 0) or ($row['precio'] == 0) )
		//if (($row['solicitaopciones'] == 'S') or ($cuentacombinados > 0) )
			{
			$salida = $salida.'<a class="btncat" href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="ficha_producto(\''.$row['id_complementog'].'\');">';
			}
		else
			{
			$salida = $salida.'<a class="btncat" href="javascript:void(null);" id="link2'.$row['id_complementog'].'" onclick="plusone(\''.$row['id_complementog'].'\');">';
			}		
		if ($row['alias'] != '')
			{
			if ($row['alias'] == ' ') { $row['alias'] = ''; }
			$salida = $salida.$row['alias'];
			}
		else
			{
			$salida = $salida.substr($row['complementog'],0,40);
			}
		if ($_SESSION['imagenes'] == 'Y')
			{
			$salida = $salida.'<img src="./image.php?id='.$row['id_complementog'].'" width="100%" height="100%" />';
			$salida = $salida.'<script> $("#imgproducto-'.$row['id_complementog'].'").appendTo("#link2'.$row['id_complementog'].'"); </script>';
			$salida = $salida.'<script>';
			$salida = $salida.' if ( $("#imgproducto-'.$row['id_complementog'].'").length > 0 ) {';
			$salida = $salida.'$("#imgproducto-'.$row['id_complementog'].'").appendTo("#link2'.$row['id_complementog'].'"); } else { createimage("P","link2'.$row['id_complementog'].'","'.$row['id_complementog'].'"); }';
			$salida = $salida.'</script>';	
			}
		
		

		
		$salida = $salida.'</a>';	
		$salida = $salida.'<div id="link'.$row['id_complementog'].'" class="procuenta"></div>';
		$salida = $salida.'<div id="linkcocina'.$row['id_complementog'].'" class="procuenta2"></div>';
		
		$salida = $salida.'</div>';
		$salida = $salida.'';
		}
		
	if (($desde + $hasta) < $cuenta)
		{
		$salida = $salida.'<div class="botonpro"><a class="btncat" href=javascript:void(null);" onclick="showproductos(\''.$_POST['padre'].'\','.($desde + $hasta).');">';
		$salida = $salida.' <span class="btncat">Siguiente</span><br/><img src="./images/adelante.jpg" width="100%" height="100%" /></a></div>';
		} 
		
	echo $salida;



 