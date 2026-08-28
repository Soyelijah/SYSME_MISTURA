# SYSME Mistura TPV

Paquete portatil del punto de venta para Windows. El repositorio conserva el
runtime necesario para iniciar el sistema sin instalar por separado Apache,
PHP o MySQL.

## Limites del sistema

- `SGC/`: aplicacion TPV, reportes, idiomas y runtime XAMPP.
- `sysmeserver/`: servidor MySQL portatil y datos iniciales del sistema.
- `tests/`: pruebas de seguridad, inventario, paginacion y contrato responsive.
- `AUDIT.md` y `SECURITY.md`: estado tecnico y condiciones antes de produccion.

Los ejecutables, DLL, reportes `.fr3`, configuraciones base y archivos de datos
no se consideran basura aunque no sean codigo fuente: forman parte del paquete
portatil. Los logs, PID, sesiones y temporales se generan al ejecutar el sistema
y no se versionan.

## Validacion

En un entorno con PHP, Node.js, `make` y `rg`:

```sh
make check
```

El resultado local no autoriza por si solo una publicacion ni el uso del TPV en
una red no confiable. Consulta los riesgos pendientes en `AUDIT.md`.
