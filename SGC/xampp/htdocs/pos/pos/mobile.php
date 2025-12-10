<?php
session_start();
unset($_SESSION['id_camarero']);

include "./conn.php";
include "./".$_SESSION['idioma'].".php";
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
								$salida = '';
								$salida = $salida.'<div class="botonpro"><a class="btncat" href=javascript:void(null);" onclick="formlogin(\''.$row['id_camarero'].'\')">';
								$salida = $salida.$row['nombre'];
								$salida = $salida.'<br/><img src="./imageempleado.php?id='.$row['id_camarero'].'" width="100%" height="100%" />';
								$salida = $salida.'</a></div>';	
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
		$('#pagina').load
			(
			'./login.php', 
			{
				passwd: $("#passwd").val(),
				imagenes: checkimagenes
			}
			);
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