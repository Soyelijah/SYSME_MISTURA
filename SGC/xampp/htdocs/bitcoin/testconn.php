<?php
require_once './jsonRPCClient.php';
 
try 
	{
	$bitcoin = new jsonRPCClient('http://'.$_POST['user'].':'.$_POST['passwd'].'@'.$_POST['host'].':'.$_POST['port'].'/');
    $resultado = $bitcoin->getbalance();
	echo "Connection OK!";
	}
catch (Exception $e)
	{
	echo "error";
	}
?>