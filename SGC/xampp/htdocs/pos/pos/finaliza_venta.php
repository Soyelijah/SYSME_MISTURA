<?php
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit();
	}
include "./conn.php";
include "./lib/security.php";
$saleId = filter_input(INPUT_POST, 'id_venta', FILTER_VALIDATE_INT);
if (!$saleId) {
	http_response_code(422);
	exit('La venta no es válida.');
}


					// control de caja abierta, si cerrada no se puede cobrar
						$result = mysql_query("select id_apcajas from apcajas where abierta = 'S' and id_caja = ".(int) $_SESSION['id_caja'],$conexion);
					if (mysql_num_rows($result))
						{
						$row = mysql_fetch_array($result);
						$id_apcajas = $row['id_apcajas'];
						}
					else
						{
						?>
						El punto de venta vinculado está cerrado; no se pueden finalizar ventas.<br/>
							<a href="#" onclick="cargaventa(<?php echo $saleId; ?>); return false;" class="btn">Volver</a>
						<?php
						exit();
						}



					// obten total
						$result = mysql_query("select round(sum((precio - (IF(descuento = 0,0,(precio * descuento)/100))) * cantidad * (1 + (avgiva / 100))),2) as total from ventadir_comg where id_venta = ".$saleId,$conexion);
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
										$paymentId = (int) $row['id_modo_pago'];
										$paymentName = htmlspecialchars($row['modo_pago'], ENT_QUOTES, 'UTF-8');
										echo "<input type='radio' name='modo' id='modo".$paymentId."' value='".$paymentId."'";
									if ($row['defecto'] == 'Y')
										{
										echo " checked='true' ";
										}
									echo "/>";
										$cadena = '"modo'.$paymentId.'"';
										echo "<a class='btncat' href='#' onclick='marca2(".$cadena."); return false;'>".$paymentName;
									echo '<img src="./images/trans.png" width="100%" height="100%" />';
									echo "</a>";
									echo "</div>";

							}
						?>
						</p>
						<div style="clear: both;"><br/></div>
						<p>
						<button type="button" id="checkout-submit" onclick="creaticket();" class="btn">Aceptar</button>
						<a href="#" onclick="cargaventa(<?php echo $saleId; ?>); return false;" class="btn">Cancelar</a>
						<span id="checkout-status" role="status" aria-live="polite"></span>
						</p>

<script>
	function creaticket()
			{
			var button = $('#checkout-submit');
			var status = $('#checkout-status');
			button.prop('disabled', true);
			status.text('Procesando cobro…');
			$.ajax({
				url: './venta/finalizaventa.php',
				type: 'POST',
				dataType: 'json',
				data: {
					id_venta: <?php echo $saleId; ?>,
					id_modo_pago: $('input:radio[name=modo]:checked').val(),
					csrf_token: <?php echo json_encode(csrf_token()); ?>
				}
			}).done(function () {
				status.text('Cobro completado.');
				carga('./abiertas.php', 'pagina');
			}).fail(function (xhr) {
				var response = xhr.responseJSON;
				status.text(response && response.error ? response.error.message : 'No se pudo completar el cobro.');
				button.prop('disabled', false);
			});
			}


</script>
