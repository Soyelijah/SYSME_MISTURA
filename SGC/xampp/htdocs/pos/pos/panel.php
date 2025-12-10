<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	exit(); 
	}
include "./".$_SESSION['idioma'].".php";

?>
			<div class="header">
                                <?php echo $txtkitchenpanel; ?>
            </div>
			
            <div class="content" id="panelcocina">
			
			</div>

			<div style="clear: both;"><br/>&nbsp;</br>&nbsp;</div>
			</div>
			<div class="footer">
							
                            <a href="javascript:void(null);" onclick="carga('./menu.php','pagina');" class="btn">
                                <?php echo $txtback; ?>
                            </a>

		
			</div>
			

				
<script>


	function refrescapanel(tpv)
		{
		setTimeout("refrescapanel()",5000);
		$('#panelcocina').load
			(
			'./panelcocina.php'
			);	
		}
	function marcar_servido(venta,linea)
		{
		$('#operaciones1').load
			(
			'./marcar_servido.php',
				{
				id_venta: venta,
				id_linea: linea
				},
			function ()
				{
				refrescapanel();
				}
			);				
		}
	refrescapanel();

</script>

