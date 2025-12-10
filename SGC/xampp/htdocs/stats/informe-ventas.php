<?php
include "./conn.php";
?>





		<div>
				<div id="informe-ventas-tipos" class='aplypadding'>
					<input type="radio" id="informe-ventas-ventas" name="informe-ventas-tipo" value="S" checked="checked" /><label for="informe-ventas-ventas">Ventas</label>
					<input type="radio" id="informe-ventas-roturas" name="informe-ventas-tipo" value="R" /><label for="informe-ventas-roturas">Roturas</label>
					<input type="radio" id="informe-ventas-invitaciones" name="informe-ventas-tipo" value="I" /><label for="informe-ventas-invitaciones">Invitaciones</label>
					<input type="radio" id="informe-ventas-auto-consumo" name="informe-ventas-tipo" value="A" /><label for="informe-ventas-auto-consumo">Auto Consumo</label>
					<input type="radio" id="informe-ventas-otros-conceptos" name="informe-ventas-tipo" value="O" /><label for="informe-ventas-otros-conceptos">Otros Conceptos</label>
				</div>
				<div class='aplypadding'>
					<label>Fecha Desde:</label><input type="text" name="fecha_desde" id="informe-ventas-fecha_desde" size="12" class="accion text ui-widget-content ui-corner-all" value="<?php echo date('Y-m-d'); ?>" />
					<label>Fecha Hasta:</label><input type="text" name="fecha_hasta" id="informe-ventas-fecha_hasta" size="12" class="accion text ui-widget-content ui-corner-all" value="<?php echo date('Y-m-d'); ?>" />
					<label>Hora Desde:</label><input type="text" name="hora_desde" id="informe-ventas-hora_desde" size="8" class="accion text ui-widget-content ui-corner-all" value="00:00:01" /> hh:mm:ss
					<label>Hora Hasta:</label><input type="text" name="hora_hasta" id="informe-ventas-hora_hasta" size="8" class="accion text ui-widget-content ui-corner-all" value="23:59:59" /> hh:mm:ss
				</div>
				<div class='aplypadding'>
					<label>Punto de Venta:</label>
					<select name="id_caja" id="informe-ventas-id_caja" class="text ui-corner-all">
						<option value=" "> </option>
						<?php
						$result2 = mysql_query("select * from cajas",$conexion);
						while ($row2 = mysql_fetch_array($result2)) 
							{
							echo '<option value="'.$row2['id_caja'].'">'.$row2['Nombre'].'</option>';
							}
						?>
					</select>
					<label>Almac&eacute;n:</label>
					<select name="id_almacen" id="informe-ventas-id_almacen" class="text ui-corner-all">
						<option value=" "> </option>
						<?php
						$result2 = mysql_query("select * from almacen",$conexion);
						while ($row2 = mysql_fetch_array($result2)) 
							{
							echo '<option value="'.$row2['id_almacen'].'">'.$row2['nom_almacen'].'</option>';
							}
						?>
					</select>
					<label>Empleado:</label>
					<select name="id_empleado" id="informe-ventas-id_empleado" class="text ui-corner-all">
						<option value=" "> </option>
						<?php
						$result2 = mysql_query("select * from camareros",$conexion);
						while ($row2 = mysql_fetch_array($result2)) 
							{
							echo '<option value="'.$row2['id_camarero'].'">'.$row2['nombre'].'</option>';
							}
						?>
					</select>
					<label>Categor&iacute;a:</label>
					<select name="id_categoria" id="informe-ventas-id_categoria" class="text ui-corner-all">
						<option value=" "> </option>
						<?php
						$result2 = mysql_query("select * from tipo_comg",$conexion);
						while ($row2 = mysql_fetch_array($result2))
							{
							echo '<option value="'.$row2['id_tipo_comg'].'">'.$row2['tipo_comg'].'</option>';
							}
						?>
					</select>
				</div>
				<div class='aplypadding'>
					<label>Producto:</label><input type="text" name="id_producto" id="informe-ventas-id_producto" size="50" class="accion text ui-widget-content ui-corner-all" />
				</div>
				<div id="informe-ventas-informes" class='aplypadding'>
					<input type="radio" id="informe-ventas-ventas-total" name="informe-ventas-informe" value="ventas-total" checked="checked" /><label for="informe-ventas-ventas-total">Total</label>
					<input type="radio" id="informe-ventas-ventas-ano" name="informe-ventas-informe" value="ventas-ano" /><label for="informe-ventas-ventas-ano">Por A&ntilde;o</label>
					<input type="radio" id="informe-ventas-ventas-mes" name="informe-ventas-informe" value="ventas-mes" /><label for="informe-ventas-ventas-mes">Por Mes</label>
					<input type="radio" id="informe-ventas-ventas-dia" name="informe-ventas-informe" value="ventas-dia" /><label for="informe-ventas-ventas-dia">Por D&iacute;a</label>
					<input type="radio" id="informe-ventas-ventas-categoria" name="informe-ventas-informe" value="ventas-categoria" /><label for="informe-ventas-ventas-categoria">Por Categor&iacute;a</label>
					<input type="radio" id="informe-ventas-ventas-producto" name="informe-ventas-informe" value="ventas-producto" /><label for="informe-ventas-ventas-producto">Por Producto</label>
				</div>
			</div>
			<div id="informe-ventas-resultado" class="ui-widget ui-widget-content ui-corner-all aplypadding">

						
			</div>

	

<script>

	
	// campos
	$( "#informe-ventas-fecha_desde" ).datepicker();
	$( "#informe-ventas-fecha_hasta" ).datepicker();
	$( "#informe-ventas-informes" ).buttonset();
	$( "#informe-ventas-tipos" ).buttonset();
	
	// eventos
	$('#informe-ventas-tipos').change(informeventasrecarga);
	$('#informe-ventas-fecha_desde').change(informeventasrecarga);
	$('#informe-ventas-fecha_hasta').change(informeventasrecarga);
	$('#informe-ventas-hora_desde').change(informeventasrecarga);
	$('#informe-ventas-hora_hasta').change(informeventasrecarga);
	$('#informe-ventas-id_caja').change(informeventasrecarga);
	$('#informe-ventas-id_almacen').change(informeventasrecarga);
	$('#informe-ventas-id_empleado').change(informeventasrecarga);
	$('#informe-ventas-id_categoria').change(informeventasrecarga);
	$('#informe-ventas-id_producto').keyup(informeventasrecarga);
	$('#informe-ventas-informes').change(informeventasrecarga);
	
	
	function informeventasrecarga() 
		{
		$('#informe-ventas-resultado').load('./informe-ventas-resultado.php', 
			{
			fecha_desde: $('#informe-ventas-fecha_desde').attr('value'),
			fecha_hasta: $('#informe-ventas-fecha_hasta').attr('value'),
			hora_desde: $('#informe-ventas-hora_desde').attr('value'),
			hora_hasta: $('#informe-ventas-hora_hasta').attr('value'),
			informe: $("input[name='informe-ventas-informe']:checked").val(),
			tipo: $("input[name='informe-ventas-tipo']:checked").val(),
			id_caja: $('#informe-ventas-id_caja').attr('value'),
			id_almacen: $('#informe-ventas-id_almacen').attr('value'),
			id_empleado: $('#informe-ventas-id_empleado').attr('value'),
			id_categoria: $('#informe-ventas-id_categoria').attr('value'),
			id_producto: $('#informe-ventas-id_producto').attr('value')
			});
		}
		
	// carga inicial
	informeventasrecarga();

</script>


