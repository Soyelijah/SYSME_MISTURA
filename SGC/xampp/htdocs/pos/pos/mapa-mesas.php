				<?php
				session_start();
				if (!isset($_SESSION['id_camarero']))
					{
					exit(); 
					}
				include "./conn.php";

				// lista mesas
				$result = mysql_query("select * from mesa where Num_Mesa <> '00' and id_salon = '".$_POST['id_salon']."'",$conexion);
				while ($row = mysql_fetch_array($result))
					{
					?>
					<div class="mesa" style="
					position: absolute;					
					width: <?php echo (($row['width']*$_SESSION['ancho'])/$_SESSION['anchotpv']); ?>px;
					height: <?php echo (($row['height']*$_SESSION['ancho'])/$_SESSION['anchotpv']); ?>px;
					top: <?php echo (($row['top']*$_SESSION['ancho'])/$_SESSION['anchotpv'])+$_POST['mapatop']; ?>px;
					left: <?php echo (($row['izq']*$_SESSION['ancho'])/$_SESSION['anchotpv'])+$_POST['mapaleft']; ?>px;
					">
					<?php
					$result2 = mysql_query("select id_venta from ventadirecta where cerrada='N' and Num_Mesa = '".$row['Num_Mesa']."' order by id_venta",$conexion);	
					if (mysql_num_rows($result2) > 0)
						{
						$row2 = mysql_fetch_array($result2);
						?>
						<a class="botonmesa2" href="javascript: void(null);" onclick="cargaventa(<?php echo $row2['id_venta']; ?>);">
						<?php
						}
					else
						{
						?>
						<a class="botonmesa" href="javascript: void(null);" onclick="$('#nueva_venta').show(); seleccionamesa('<?php echo $row['Num_Mesa']; ?>'); add();">
						<?php						
						}
					?>
					<?php echo $row['descripcion']; ?>
					
					</a>
					</div>
					<?php
					}
					
				?>