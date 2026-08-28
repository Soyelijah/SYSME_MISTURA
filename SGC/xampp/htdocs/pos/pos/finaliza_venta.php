<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./conn.php";

					 
					// control de caja abierta, si cerrada no se puede cobrar
					$result = mysql_query("select id_apcajas from apcajas where abierta = 'S' and id_caja = ".$_SESSION['id_caja'],$conexion);
					if (mysql_num_rows($result))
						{
						$row = mysql_fetch_array($result);
						$id_apcajas = $row['id_apcajas'];
						}
					else
						{
						?>
						El punto de venta vinculado esta cerrado, no se pueden finalizar ventas<br/>
						<a href="javascript:void(null);" onclick="cargaventa(<?php echo $_POST['id_venta']; ?>);" class="btn">Volver</a>
						<?php 
						exit();
						}



					// obten total
					$result = mysql_query("select round(sum((precio - (IF(descuento = 0,0,(precio * descuento)/100))) * cantidad * (1 + (avgiva / 100))),2) as total from ventadir_comg where id_venta = ".$_POST['id_venta'],$conexion);
					$row = mysql_fetch_array($result);
					if (!isset($row['total']))
						{
						$row['total'] = '0.00';
						}
						$total = $row['total'];
						?>
						<p>
						<strong>Total: <?php echo $row['total'].' '.$_SESSION['moneda']; ?></strong>							
						</p>

						<p>
						<?php
						// obten formas de pago
						$result = mysql_query("select * from modo_pago where activo = 'Y'",$conexion);
						while ($row = mysql_fetch_array($result))
							{
									echo "<div class='botonprocombi'>";
									echo "<input type='radio' name='modo' id='modo".$row['id_modo_pago']."' value='".$row['id_modo_pago']."'";
									if ($row['defecto'] == 'Y') 
										{
										echo " checked='true' "; 	
										}
									echo "/>";
									$cadena = '"modo'.$row['id_modo_pago'].'"';
									echo "<a class='btncat' href='javascript: void(null);' onclick='marca2(".$cadena.");'>".$row['modo_pago'];
									echo '<img src="./images/trans.png" width="100%" height="100%" />';
									echo "</a>";
									echo "</div>";	
							
							}
						?>
						</p>
						<div style="clear: both;"><br/></div>
						<p>
						<a href="javascript:void(null);" onclick="creaticket();" class="btn">Aceptar</a>
						<a href="javascript:void(null);" onclick="cargaventa(<?php echo $_POST['id_venta']; ?>);" class="btn">Cancelar</a>
						</p>
					
<script>
function creaticket()
		{
		$('#pagina').load
			(
			'./venta/finalizaventa.php',
			{
			id_venta: <?php echo $_POST['id_venta']; ?>,
			id_modo_pago: $('input:radio[name=modo]:checked').val(),
			total: <?php echo $total; ?>	
			}
			);
		}


</script>
					