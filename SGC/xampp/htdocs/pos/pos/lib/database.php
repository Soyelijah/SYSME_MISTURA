<?php

function application_database()
{
	static $database = null;
	if ($database instanceof PDO) {
		return $database;
	}

	$required = array('dbhost', 'dbport', 'dbname', 'dbuser', 'dbpass');
	foreach ($required as $key) {
		if (!isset($_SESSION[$key])) {
			throw new RuntimeException('Database configuration is incomplete.');
		}
	}

	$dsn = 'mysql:host=' . $_SESSION['dbhost'] . ';port=' . (int) $_SESSION['dbport']
		. ';dbname=' . $_SESSION['dbname'] . ';charset=utf8';
	$database = new PDO($dsn, $_SESSION['dbuser'], $_SESSION['dbpass'], array(
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		PDO::ATTR_EMULATE_PREPARES => false,
	));

	return $database;
}
