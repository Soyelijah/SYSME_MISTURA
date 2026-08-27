<?php
session_start();
unset($_SESSION['id_camarero']);

include "./conn.php";
include "./".$_SESSION['idioma'].".php";
include "./lib/security.php";
?>

			<div class="header">
                SYSME TPV
            </div>

            <div class="content">
			<div class="incontent">

							<div id="boxempleados">
							<h3>Empleado</h3>
							<?php
							$result = mysql_query("select id_camarero,nombre from camareros where activo = 'S'",$conexion);
							while ($row = mysql_fetch_array($result))
								{
								$employeeId = (int) $row['id_camarero'];
								$employeeName = htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8');
								$salida = '<div class="botonpro"><button type="button" class="btncat tile-action" onclick="formlogin('.$employeeId.')">';
								$salida .= $employeeName;
								$salida .= '<br/><img src="./imageempleado.php?id='.$employeeId.'" alt="" width="100%" height="100%" />';
								$salida .= '</button></div>';
								echo $salida;
								}
							?>
							</div>
							<div style="clear: both;"><br/></div>
							<div id="formulario">



							</div>

            </div>
			</div>
			<div class="footer"></div>






<script>

$(document).ready(function(){
   $("#accessform").submit(function(){
   login();
   //El return false va igual
   return false;
  });
 });

	function login()
		{
		var checkimagenes = 'Y';
		//if ($("#imagenes").is(':checked'))
		//	{
		//	checkimagenes = 'Y';
		//	}
		//else
		//	{
		//	checkimagenes = 'N';
		//	}
			$('#login-status').remove();
			$('<div id="login-status" role="status" aria-live="polite">Identificando…</div>').appendTo('#formulario');
			$.ajax({
				url: './login.php',
				type: 'POST',
				dataType: 'json',
				data: {
					id_camarero: $("#id_camarero").val(),
					passwd: $("#passwd").val(),
					imagenes: checkimagenes,
					csrf_token: <?php echo json_encode(csrf_token()); ?>
				}
			}).done(function () {
				carga('./menu.php', 'pagina');
			}).fail(function (xhr) {
				var response = xhr.responseJSON;
				$('#login-status').text(response && response.error ? response.error.message : 'No se pudo iniciar sesión.');
			});
		}
	function formlogin(id)
		{
		$('#formulario').load
			(
			'./form-login.php',
			{
				id_camarero: id
			}
			);
		}

var elemento = $(".footer");
var posicion = elemento.position();

var alto = posicion.top - elemento.height() - $(".header").height() - 20;
$("#boxempleados").height((45*alto)/100);

</script>
