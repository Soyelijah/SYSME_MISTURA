<?php
session_start();
include "./".$_SESSION['idioma'].".php";
$employeeId = filter_input(INPUT_POST, 'id_camarero', FILTER_VALIDATE_INT);
if (!$employeeId) { exit('Empleado no válido.'); }
?>
								<form id="accessform" action="#" method="POST">

									<?php echo $txtemployeepasswd; ?>
									<br/>
									<input type="hidden" id="id_camarero" name="id_camarero" value="<?php echo (int) $employeeId; ?>" />
									<input type="password" id="passwd" name="passwd" placeholder="<?php echo htmlspecialchars($txtemployeepasswd, ENT_QUOTES, 'UTF-8'); ?>" size="20" autocomplete="current-password" />

								<br/><br/>
								<a class="btn" href="javascript:void(null);" onclick="login();"><?php echo $txtaccept; ?></a>

								</form>

<?php

if ($_SESSION['login'] == "S")
	{
	//
	}
else
	{
	echo "<script>login();</script>";
	}
?>
