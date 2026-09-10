# Estado verificado y ruta de trabajo

Fecha de verificación: 2026-09-10.

## Fuente de verdad

- La referencia de nube registrada en `.git/FETCH_HEAD` es `main` del repositorio
  `Soyelijah/SYSME_MISTURA` y apunta al commit `95429bf`.
- La copia local partió de ese mismo commit. `origin` ya está configurado, pero la
  red devolvió HTTP 403 al intentar actualizar sus referencias; por eso
  no se puede asegurar que `main` no haya avanzado después del último `fetch`.
- Antes de cualquier trabajo nuevo se debe configurar `origin`, actualizar las
  referencias y crear una rama desde `origin/main`. No deben hacerse dos cambios
  equivalentes por separado en local y en la interfaz web.

```bash
git fetch --prune origin
git switch -c trabajo/<tema> origin/main
npm run check
```

Al terminar: ejecutar `npm run check`, confirmar los cambios, subir la misma rama
y fusionarla mediante pull request. La siguiente tarea siempre debe comenzar con
`git fetch --prune origin` y una comparación con `origin/main`.

## Arquitectura encontrada

El repositorio contiene dos sistemas distintos:

1. La aplicación actual React/Vite (`src/` y `server.ts`). Es una demostración que
   conserva usuarios, PIN, ventas, caja, inventario y configuración en
   `localStorage`. El servidor solo publica la aplicación y `/api/health`.
2. Una distribución histórica de SYSME/XAMPP en `SGC/`, con binarios, librerías,
   configuraciones y PHP antiguo. Se detectaron 41 archivos PHP con llamadas
   `mysql_*`.

Los dos sistemas no comparten actualmente una API ni una base de datos. La pantalla
"Database Manager" de React administra colecciones del navegador; no administra
la base MySQL incluida en el sistema histórico. No se debe presentar esta versión
como TPV multiusuario o persistencia de producción.

## Correcciones aplicadas durante la verificación

- Se eliminó una omisión de autenticación que aceptaba cualquier contraseña en el
  modal de empleado al terminar usando siempre el empleado actual.
- Se eliminaron el acceso rápido sin PIN y todas las pistas que mostraban los PIN
  de demostración en las pantallas de acceso. La validación compartida exige un
  usuario activo, cuatro dígitos y coincidencia exacta, con pruebas automatizadas.
- Se alinearon contratos TypeScript entre contexto, inventario, menú digital,
  impresión, sonidos, favoritos, productos y ventas.
- Los productos de demostración declaran su bloque de cocina obligatorio.
- Se incorporó un control repetible (`npm run check`) y CI para impedir fusionar
  una aplicación que no supere tipos y compilación.
- El servidor respeta `PORT`, necesario en despliegues administrados.

## Riesgos y prioridades

### P0: decidir el producto que continuará

No mezclar cambios funcionales hasta decidir una de estas rutas:

- **Recomendada:** React como interfaz nueva y un backend/API real como única
  autoridad de datos; importar gradualmente reglas verificadas del PHP.
- Mantener el PHP histórico y limitar React a prototipo visual.

No es seguro operar ambas implementaciones como si fueran una sola: actualmente
pueden producir estados diferentes y ninguna sincroniza datos con la otra.

### P0: persistencia y seguridad

Si continúa React, crear autenticación y autorización en servidor, base de datos,
transacciones para venta/caja/stock, validación de entrada, sesiones seguras,
auditoría y copias de seguridad restaurables. Los PIN y permisos del navegador
no constituyen un control de seguridad.

El endurecimiento del PIN en cliente es solo una corrección provisional. La fase
de autenticación no se considerará terminada hasta que el servidor almacene hashes,
emita una sesión segura y aplique autorización a cada operación protegida.

### P1: separar el legado

Inventariar qué parte de `SGC/` tiene licencia y utilidad, sacar ejecutables y el
runtime XAMPP del repositorio de aplicación y conservar solo migraciones, informes
o fixtures necesarios. Los 41 PHP con `mysql_*` no deben exponerse a Internet.

### P1: pruebas

Añadir pruebas unitarias de totales, IVA, descuentos, permisos e inventario;
pruebas de integración del backend; y recorridos E2E para apertura de caja, venta,
cocina, cobro, cancelación, cierre Z y recuperación tras fallo.

### P2: rendimiento y dependencias

La compilación genera actualmente un paquete JavaScript superior a 1 MB. Separar
vistas con carga diferida. La auditoría npm no se puede usar sin `package-lock.json`;
el proyecto adopta `bun.lock`, por lo que CI usa Bun y la revisión de dependencias
debe configurarse para ese gestor.

## Regla para evitar divergencias

Una tarea corresponde a una rama, un commit revisable y un pull request. No editar
simultáneamente la misma tarea en la nube y local. Si se realizan cambios desde una
herramienta web, primero se fusionan en `main`; después el trabajo local actualiza
`origin/main` antes de continuar.
