<?php 
session_start();
if (!isset($_SESSION['id_camarero']))
	{
	header ("Location: ./mobile.php"); 
	}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
        </title>
        <link rel="stylesheet" href="./css/css.css" />
        <style>
            /* App custom styles */
        </style>
        <script src="./js/jquery.js">
        </script>
        <script src="./js/jquerym.js">
		$(document).bind("mobileinit", function(){
			$.mobile.hidePageLoadingMsg();    
		});
        </script>
    </head>
    <body>

        <div data-role="page">
            <div data-role="header">
                <h3>
                    Opciones Venta
                </h3>
            </div>
            <div data-role="content">
				<a data-role="button" data-icon="refresh" href="./cambio_mesa.php?id_venta=<?php echo $_GET['id_venta']; ?>" data-transition="none">Cambiar de Mesa</a>
				<a data-role="button" data-icon="star" href="./venta.php?id_venta=<?php echo $_GET['id_venta']; ?>&enviar_cocina=Y" data-transition="none">Enviar a Cocina</a>
				<a data-role="button" data-icon="star" href="./venta.php?id_venta=<?php echo $_GET['id_venta']; ?>&imprimir_preticket=Y" data-transition="none">Imprimir Pre-Ticket</a>

				<br/><br/>
				<a data-role="button" data-icon="delete" data-theme="b" href="#" data-rel="back" data-transition="none">Cancelar</a>
				<!--<a data-role="button" data-icon="delete" data-theme="b" href="./abiertas.php?cancelar_venta=<?php echo $_GET['id_venta']; ?>">Cancelar Venta</a>-->
            </div>
        </div>

    </body>
</html>