<?php
if (!isset($_SESSION['dbhost']))
{
$file = fopen ("../dbhost.txt", "r");
$content = fread($file, filesize("../dbhost.txt"));
$_SESSION['dbhost'] = trim($content," \t\n\r\0\x0B").":4306";
}

if (!isset($_SESSION['dbuser']))
{
$file = fopen ("../dbuser.txt", "r");
$content = fread($file, filesize("../dbuser.txt"));
$_SESSION['dbuser'] = trim($content," \t\n\r\0\x0B");
}

if (!isset($_SESSION['dbpass']))
{
$file = fopen ("../dbpass.txt", "r");
$content = fread($file, filesize("../dbpass.txt"));
$_SESSION['dbpass'] = trim($content," \t\n\r\0\x0B");
}

if (!isset($_SESSION['dbname']))
{
$file = fopen ("../dbname.txt", "r");
$content = fread($file, filesize("../dbname.txt"));
$_SESSION['dbname'] = trim($content," \t\n\r\0\x0B");
}

$conexion = mysql_connect($_SESSION['dbhost'], $_SESSION['dbuser'], $_SESSION['dbpass']) or die ("Error connecting database");
mysql_set_charset("utf8",$conexion);
mysql_select_db($_SESSION['dbname']);
?>