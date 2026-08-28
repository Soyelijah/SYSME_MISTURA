<?php 
session_start();

include "./conn.php";


	$salida = "<h3>Sub Categorías</h3>";
	
	$padre = $_POST['padre'];
	$desde = $_POST['desde'];
	
	// cuenta categorias
	$sql = "select count(*) as cuenta from tipo_comg where cafeteria = 'S' and visibleen = '0' and padre = '".$_POST['padre']."'";
	$result = mysql_query($sql,$conexion);
	$row = mysql_fetch_array($result);
	$cuenta = $row['cuenta'];
	if ($cuenta == 0)
		{
			//echo $_POST['contenido']; 
			$sqlpadre = "select padre from tipo_comg where id_tipo_comg = '".$_POST['padre']."'";
			$resultpadre = mysql_query($sqlpadre,$conexion);
			$rowpadre = mysql_fetch_array($resultpadre);
			if (isset($rowpadre['padre']))
				{
				echo '<script> showsubcategorias(\''.$rowpadre['padre'].'\',0); </script>';
				}
			else
				{
				echo '<script> $("#boxsubcategorias").hide(); </script>';
				}
			exit;
		}
	
	echo '<script> $("#boxsubcategorias").show(); </script>';
	
	if ($desde + 13 > $cuenta)
		{
		$hasta = 14;
		} 
	else
		{
		$hasta = 13;
		} 
		
	if ($desde + 8 > $cuenta)
		{
		$hasta = 9;
		} 
	else
		{
		$hasta = 8;
		} 
		
	// SI QUEREMOS 2 LINEAS DE CATEGORIAS
	if ($desde + 6 > $cuenta)
		{
		$hasta = 7;
		} 
	else
		{
		$hasta = 6;
		}
	
	$sqlpadre = "select padre from tipo_comg where id_tipo_comg = '".$_POST['padre']."'";
	$resultpadre = mysql_query($sqlpadre,$conexion);
	$rowpadre = mysql_fetch_array($resultpadre);
	
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
	
	$sql = "select id_tipo_comg,tipo_comg,alias from tipo_comg where cafeteria = 'S' and visibleen = '0' and padre = '".$_POST['padre']."' order by ".$orderby." limit ".$desde.",".$hasta;
	$result = mysql_query($sql,$conexion);
	if (mysql_num_rows($result) == 0)
		{
		if (isset($rowpadre['padre']))
			{
			echo $_POST['contenido'];
			}
		}
	else
		{
		if ($desde <= 0)
		{
		if (isset($rowpadre['padre']))
			{
			$back = $rowpadre['padre'];
			}
		else
			{
			$back = "F";
			}
		$desde2 = 0;
		}
		else
		{
		$back = $_POST['padre'];	
		$desde2 = $desde - 3;
		}
		
		$salida = $salida.'<div class="botonsub">';
		$salida = $salida.'<a class="btncat" href="javascript:void(null);" onclick="showsubcategorias(\''.$back.'\','.$desde2.'); showproductos(\''.$back.'\',0);">';
		$salida = $salida.'Volver<br/>';
		$salida = $salida.'<img src="./images/volver.jpg" width="100%" height="100%" /></a>';
		$salida = $salida."</div>";
			
		}
		
		
	while ($row = mysql_fetch_array($result))
		{
		$salida = $salida.'<div class="botonsub">';
		$salida = $salida.'<a class="btncat" id="link9'.$row['id_tipo_comg'].'" href="javascript:void(null);" onclick="showsubcategorias(\''.$row['id_tipo_comg'].'\',0); showproductos(\''.$row['id_tipo_comg'].'\',0);">';

		if ($row['alias'] != '')
			{
			if ($row['alias'] == ' ') { $row['alias'] = ''; }
			$salida = $salida.$row['alias'];
			}
		else
			{
			$salida = $salida.$row['tipo_comg'];
			}

			//$salida = $salida.'<img src="./imagecat.php?id='.$row['id_tipo_comg'].'" width="100%" height="100%" />';	
			$salida = $salida.'<script>';
			$salida = $salida.' if ( $("#imgsubcategoria-'.$row['id_tipo_comg'].'").length > 0 ) {';
			$salida = $salida.'$("#imgsubcategoria-'.$row['id_tipo_comg'].'").appendTo("#link9'.$row['id_tipo_comg'].'"); } else { createimage("S","link9'.$row['id_tipo_comg'].'","'.$row['id_tipo_comg'].'"); }';
			$salida = $salida.'</script>';	
			
		
		$salida = $salida.'</a>';
		$salida = $salida."</div>";
		}
		
	if (($desde + $hasta) < $cuenta)
		{
		$salida = $salida.'<div class="botonsub"><a class="btncat" href=javascript:void(null);" onclick="showsubcategorias(\''.$_POST['padre'].'\','.($desde + $hasta).');">';
		$salida = $salida.' Siguiente<br/><img src="./images/adelante.jpg" width="100%" height="100%" /></a></div>';
		} 
	
	echo $salida;



 