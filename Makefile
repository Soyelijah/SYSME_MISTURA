.PHONY: test lint

test:
	php tests/product_pagination_test.php

lint:
	php -l SGC/xampp/htdocs/pos/pos/lib/product_pagination.php
	php -l SGC/xampp/htdocs/pos/pos/productos.php
	php -l SGC/xampp/htdocs/pos/pos/finaliza_venta.php
	php -l tests/product_pagination_test.php
