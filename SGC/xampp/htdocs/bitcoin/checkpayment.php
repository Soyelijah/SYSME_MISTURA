<?php
require_once './jsonRPCClient.php';
 
try 
	{
	$bitcoin = new jsonRPCClient('http://'.$_POST['user'].':'.$_POST['passwd'].'@'.$_POST['host'].':'.$_POST['port'].'/');
	
	// btn recibidos en la nueva direcci�n (segundo parametro es confirmaciones minimas)
	$_POST['confirmations'] = $_POST['confirmations'] + 0;
	echo $bitcoin->getreceivedbyaddress($_POST['address'],$_POST['confirmations']);	
	echo " BTC";
	
	}
catch (Exception $e)
	{
	echo "error";
	}
	
?>