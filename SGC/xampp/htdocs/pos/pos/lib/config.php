<?php

function application_config($rootDirectory)
{
	$localFile = rtrim($rootDirectory, '/\\') . '/sysmetpv.local.ini';
	$exampleFile = rtrim($rootDirectory, '/\\') . '/sysmetpv.ini.example';
	$config = file_exists($localFile) ? parse_ini_file($localFile) : array();

	$environment = array(
		'dbhost' => 'SYSME_DB_HOST', 'dbport' => 'SYSME_DB_PORT',
		'dbuser' => 'SYSME_DB_USER', 'dbpass' => 'SYSME_DB_PASSWORD',
		'dbname' => 'SYSME_DB_NAME',
	);
	foreach ($environment as $key => $variable) {
		$value = getenv($variable);
		if ($value !== false && $value !== '') {
			$config[$key] = $value;
		}
	}

	if (file_exists($exampleFile)) {
		$config += parse_ini_file($exampleFile);
	}

	foreach (array('dbhost', 'dbport', 'dbuser', 'dbpass', 'dbname') as $required) {
		if (!isset($config[$required]) || $config[$required] === '') {
			throw new RuntimeException('Falta la configuración segura de base de datos: ' . $required);
		}
	}

	if (strtolower($config['dbuser']) === 'root') {
		throw new RuntimeException('La aplicación no puede conectarse a la base de datos como root.');
	}

	return $config;
}
