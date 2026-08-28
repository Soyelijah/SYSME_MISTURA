<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
	$salida = "";
	$desde = $_POST['desde'];

	
	// cuenta categorias
	$sql = "select count(*) as cuenta from tipo_comg where cafeteria = 'S' and visibleen = '0' and padre is null";
	$result = mysql_query($sql,$conexion);
	$row = mysql_fetch_array($result);
	$cuenta = $row['cuenta'];
	

		
	// SI QUEREMOS 3 LINEAS DE CATEGORIAS
	if ($desde + 13 > $cuenta)
		{
		$hasta = 14;
		} 
	else
		{
		$hasta = 13;
		} 
		
	// SI QUEREMOS 3 LINEAS DE CATEGORIAS
	if ($desde + 8 > $cuenta)
		{
		$hasta = 9;
		} 
	else
		{
		$hasta = 8;
		} 
		
	

	// favoritos
	if ($desde == 0)
		{
		$salida = $salida.'<div class="boton"><a class="btncat" href=#" onclick="showcategorias(0); showproductos(\'F\',0);">';
		$salida = $salida.' <span class="btncatcat">Favoritos</span><br/><img src="./images/star.jpg" width="100%" height="100%" /></a></div>';
		}
	else
		{
		$valor = $desde - $hasta;
		if ($valor < 0) { $valor = 0; }
		$salida = $salida.'<div class="boton"><a class="btncat" href=#" onclick="showcategorias('.$valor.');">';
		$salida = $salida.' <span class="btncatcat">Volver</span><br/><img src="./images/volver.jpg" width="100%" height="100%" /></a></div>';
		}
		
		
	if (isset($_SESSION['ordercat']))
		{
		if ($_SESSION['ordercat'] == '0')
			{
			$orderby = 'id_tipo_comg';	
			}
		if ($_SESSION['ordercat'] == '1')
			{
			$orderby = 'tipo_comg';	
			}
		if ($_SESSION['ordercat'] == '2')
			{
			$orderby = 'sort_order';	
			}
		}
	else
		{
		$orderby = 'id_tipo_comg';	
		}
	$sql = "select id_tipo_comg,tipo_comg,alias from tipo_comg where cafeteria = 'S' and visibleen = '0' and padre is null order by ".$orderby." limit ".$desde.",".$hasta;
	$result = mysql_query($sql,$conexion);
	
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'<div class="boton"><a class="btncatcat" href=#" id="link8'.$row['id_tipo_comg'].'" onclick="showsubcategorias(\''.$row['id_tipo_comg'].'\',0); showproductos(\''.$row['id_tipo_comg'].'\',0);">';
		
		if ($row['alias'] != '')
			{
			if ($row['alias'] == ' ') { $row['alias'] = ''; }
			$salida = $salida.$row['alias'];
			}
		else
			{
			$salida = $salida.$row['tipo_comg'];
			}
		if ($_SESSION['imagenes'] == 'Y')
			{
			$salida = $salida.'<img src="./imagecat.php?id='.$row['id_tipo_comg'].'" width="100%" height="100%" />';
			$salida = $salida.'<script>';
			$salida = $salida.' if ( $("#imgcategoria-'.$row['id_tipo_comg'].'").length > 0 ) {';
			$salida = $salida.'$("#imgcategoria-'.$row['id_tipo_comg'].'").appendTo("#link8'.$row['id_tipo_comg'].'"); } else { createimage("C","link8'.$row['id_tipo_comg'].'","'.$row['id_tipo_comg'].'"); }';
			$salida = $salida.'</script>';	
			}
		
		$salida = $salida.'</a></div>';	
		//$salida = $salida.'<script> $("#imgcategoria-'.$row['id_tipo_comg'].'").appendTo("#link8'.$row['id_tipo_comg'].'"); </script>';
		}
	if (($desde + $hasta) < $cuenta)
		{
		$salida = $salida.'<div class="boton"><a class="btncat" href=#" onclick="showsubcategorias(\'F\',0); showcategorias('.($desde + $hasta).');">';
		$salida = $salida.' <span class="btncatcat">Siguiente</span><br/><img src="./images/adelante.jpg" width="100%" height="100%" /></a></div>';
		} 
		
	echo $salida;

?>
<div id="boxsubcategorias" style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; display: none; background-color: #eeeeee;">
</div>