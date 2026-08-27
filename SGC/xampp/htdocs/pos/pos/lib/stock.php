<?php

/**
 * Applies a stock delta to a product and all recursively configured pack items.
 * The caller owns the surrounding transaction.
 */
function apply_stock_delta(PDO $database, $warehouseId, $productId, $delta, array $path = array())
{
	$productId = (string) $productId;
	if (isset($path[$productId])) {
		throw new RuntimeException('Pack configuration contains a cycle.');
	}
	if (!is_numeric($delta)) {
		throw new InvalidArgumentException('Stock delta must be numeric.');
	}

	$path[$productId] = true;
	$update = $database->prepare(
		'update almacen_complementg set cantidad = cantidad + ? '
		. 'where id_almacen = ? and id_complementog = ?'
	);
	$update->execute(array($delta, $warehouseId, $productId));

	$components = $database->prepare(
		'select id_complementog1, cantidad from pack where id_complementog = ?'
	);
	$components->execute(array($productId));
	while ($component = $components->fetch()) {
		apply_stock_delta(
			$database,
			$warehouseId,
			$component['id_complementog1'],
			((float) $delta) * (float) $component['cantidad'],
			$path
		);
	}
}
