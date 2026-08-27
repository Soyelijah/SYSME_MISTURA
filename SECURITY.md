# Seguridad de SYSME TPV

## Configuración

Las credenciales reales no se almacenan en Git. Copia
`SGC/xampp/htdocs/sysmetpv.ini.example` como `sysmetpv.local.ini` o define las
variables `SYSME_DB_HOST`, `SYSME_DB_PORT`, `SYSME_DB_USER`,
`SYSME_DB_PASSWORD` y `SYSME_DB_NAME`.

El usuario de base de datos debe ser exclusivo para la aplicación y disponer
únicamente de los permisos necesarios. La aplicación rechaza expresamente el
usuario `root`. La contraseña que estuvo versionada debe considerarse
comprometida y rotarse antes de desplegar esta versión.

## Cambios de seguridad incorporados

- El cobro recalcula el total en servidor y no acepta el total del navegador.
- El ticket, movimiento, cierre e impresión se confirman en una transacción.
- El cobro exige autenticación, permiso de finalización y token CSRF.
- Login, imágenes y cobro utilizan consultas preparadas mediante PDO.
- El login vincula la credencial al empleado seleccionado, regenera la sesión y
  limita intentos repetidos.
- La autorización acepta la convención `Y/N` utilizada por el TPV y mantiene
  compatibilidad con instalaciones históricas que usan `S/N`.
- Los endpoints JSON no muestran errores de base de datos.

## Despliegue y migración

1. Rota las credenciales antiguas y crea el usuario de mínimo privilegio.
2. Crea `sysmetpv.local.ini` fuera del control de versiones.
3. Verifica que PDO MySQL está habilitado.
4. Ejecuta `make check` antes del despliegue.
5. Prueba cobro, reversión, impresión y concurrencia en una copia de la base de
   datos antes de actualizar producción.

Los demás scripts heredados todavía deben migrarse gradualmente de `mysql_*` a
PDO. No deben exponerse a redes no confiables hasta completar esa migración.

## Reporte de vulnerabilidades

No publiques credenciales ni datos comerciales en incidencias. Reporta el
problema por el canal privado del responsable del sistema e incluye únicamente
pasos mínimos de reproducción y la versión afectada.
