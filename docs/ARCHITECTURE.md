# Arquitectura y lineamientos

## Arquitectura general
- SPA en React (Vite) con estado global en memoria dentro de `DataContext` y propagado vía `useData`.
- No hay backend ni API; todas las operaciones son en cliente. El modal global “+ Nuevo” (NewModal) es el punto de entrada de creación.
- Navegación controlada por estado en `App.jsx` y sidebar; sin router externo. `RegisterPage` existe solo para usos de desarrollo.
- Scripts destructivos legacy están aislados en `scripts/legacy/`; `scripts/update-finanzas.sh` es un stub seguro que solo hace backup.

## Flujo de datos (SSOT)
- Modelos principales: `movements`, `objectives` (con `goals` money|action), `tasks`, `notes`, `activityLog`.
- El provider inicializa desde `localStorage` si existe, o desde `sampleData`; persiste cambios automáticamente (mejora: resiliencia a refresh).
- `getPendingItems` construye una inbox unificada (movimientos pending sin confirmar, metas de acción pending, tareas pending) y clasifica por bucket: `today`, `overdue`, `upcoming` según fecha; expone `todayISO` para vistas.
- Activity log se genera automáticamente al crear/confirmar/resolver/cancelar; arranca vacío y es read-only.

## Responsabilidades de páginas
- **Dashboard**: visualiza contadores de pendientes (HOY/ATRASADOS/SIN FECHA), finanzas del mes confirmadas (usa `finalAmount`), objetivos activos + metas acción pendientes, y últimos 5 eventos del log.
- **Pendientes**: lista HOY/ATRASADO/SEMANA/SIN FECHA con acciones de confirmar movimientos (EQUAL/MORE/LESS/NO_SHOW) y resolver/reprogramar/cancelar metas/tareas.
- **Finanzas**: filtros de estado (confirmados/pendientes/cancelados/todos) y rango (mes/todo); tabla y totales ordenados por fecha descendente, usando `finalAmount` como monto efectivo.
- **Objetivos**: muestra objetivos y metas; metas `action` resolvibles, metas `money` visuales.
- **Actividades**: tabs Tareas (CRUD ligero) y Activity Log (solo lectura, orden desc, empty state claro).
- **Calendario**: vista mensual navegable con utilidades de fecha compartidas.
- **RegisterPage**: herramienta de desarrollo; oculta por defecto en el sidebar (flag `DEV_MODE`).

## Convenciones de estado y fechas
- Fechas ISO `YYYY-MM-DD`; helper centralizado `toISODate` y utilidades en `lib/dateUtils.js` (`startOfWeekMonday`, `endOfWeekSunday`, `daysBetween`, `getTodayISO`).
- Status: movimientos (`pending|confirmed|canceled` + `confirmationOutcome` EQUAL/MORE/LESS/NO_SHOW), metas (`pending|done|canceled`), tareas (`pending|done|canceled`).
- Activity log: entradas con `type`, `payload`, `createdAt`; generado solo por acciones del sistema.

## Decisiones técnicas y trade-offs
- **Estado en memoria + localStorage**: simplicidad y cero backend; trade-off: sin sincronización multi-dispositivo ni control de concurrencia.
- **Inbox unificada**: evita lógica duplicada entre Dashboard/Pendientes, pero requiere fallbacks de fecha para items sin `date/dueDate`.
- **Seguridad operativa**: scripts legacy aislados; stub actual hace backup antes de salir. Trade-off: el legacy sigue disponible en `scripts/legacy/` (requiere advertencias claras).
- **Validaciones ligeras**: se permiten creaciones con datos mínimos; facilita flujo rápido pero deja espacio a entradas incompletas.

## Riesgos conocidos
- Sin persistencia remota: los datos solo viven en `localStorage`; limpiar el storage o usar otro navegador vacía el estado.
- Validaciones mínimas: títulos/fechas opcionales pueden producir datos ruidosos (aunque las vistas son defensivas ante faltantes).
- Activity log parcial: no distingue ciertos sub-tipos (p. ej., reprogramación vs creación) y puede perderse al limpiar storage.
- RegisterPage sigue accesible por ruta interna aunque oculta en el menú; riesgo bajo pero a vigilar.
- Script legacy sigue existiendo en `scripts/legacy/`; ejecutar sin entenderlo puede resetear el código.

## Recomendaciones futuras (no aplicadas)
- Añadir versiónado de storage y migraciones ligeras para evitar datos incompatibles tras cambios de modelo.
- Mejorar validaciones en creadores (título requerido, fechas válidas) y evitar confirmaciones múltiples en paralelo.
- Incluir sub-tipos en activity log (p.ej., `task_rescheduled`) para auditoría fina.
- Mover RegisterPage detrás de un flag global en `App.jsx` o ruta protegida de dev.
- Considerar persistencia opcional en backend ligero o export/import para respaldar el SSOT.
