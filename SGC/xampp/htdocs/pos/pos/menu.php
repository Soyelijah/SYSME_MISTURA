<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";
include "./".$_SESSION['idioma'].".php";
// datos del empleado
$result = mysql_query("select * from camareros where id_camarero = '".$_SESSION['id_camarero']."'",$conexion);
$row = mysql_fetch_array($result);
$empleado = $row['nombre'];
// cuenta ventas abiertas
$result = mysql_query("select count(*) as cuenta from ventadirecta where cerrada='N'",$conexion);
$row = mysql_fetch_array($result);
$abiertas = $row['cuenta'];
?>

			<div class="header">
                                <?php echo $txtappname; ?>
            </div>
			
            <div class="content">
			<div class="incontent">
			
				<ul>
					<li><?php echo $txtemployee; ?>: <strong><?php echo $empleado; ?></strong></li>
					<li><?php echo $txtstore; ?>: <strong><?php echo $_SESSION['almacen']; ?></strong></li>
					<li><?php echo $txtpos; ?>: <strong><?php echo $_SESSION['tpv']; ?></strong></li>
				</ul>
				<a class="btn" href="javascript:void(null);" onclick="carga('./abiertas.php','pagina');"><?php echo $txtopensales; ?> (<?php echo $abiertas; ?>)</a>
				<br/><br/>
				<a class="btn" href="javascript:void(null);" onclick="carga('./panel.php','pagina');"><?php echo $txtkitchenpanel; ?></a>
				

			</div>
			</div>
			<div class="footer">


							<a href="./index.php" class="btn">
                                <?php echo $txtclosesession; ?>
                            </a>

            </div>
				
