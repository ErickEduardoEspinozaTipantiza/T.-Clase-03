# Informe de Entregables: Proyecto 02 - 3 Tickets de Mejora

**Repositorio:** EPN Event Manager
**Autor:** Erick Eduardo Espinoza Tipantiza
**Versión Liberada:** v1.2.0

Este informe detalla el cumplimiento estricto del ciclo de vida de desarrollo, la implementación técnica de los 3 tickets asignados y las métricas de calidad obtenidas durante la ejecución del Proyecto 02.

---

## 1. Cumplimiento del Ciclo de Vida (Kanban y Git Flow)

Para que los tickets se consideren válidos, atravesaron el siguiente ciclo de vida formal, evidenciado en el repositorio de GitHub:

1. **[ BACKLOG ] & Refinamiento (DoR):** Los 3 tickets fueron documentados y creados como *Issues* en GitHub (#1, #2, #3), incluyendo descripciones, criterios de aceptación (DoR) y etiquetas correctas (`enhancement`, `chore`).
2. **[ IN PROGRESS ] & Desarrollo:** Se crearon 3 ramas independientes a partir de `develop`:
   - `feature/date-range-filter`
   - `feature/correlation-id`
   - `feature/release-automation`
3. **[ QA / PIPELINE ]:** Cada commit disparó el pipeline de Integración Continua (GitHub Actions) validando:
   - Cero errores de Linter (`npm run lint`).
   - Pruebas unitarias (`npm run test:cov`).
   - Construcción del proyecto (`npm run build`).
4. **[ DoD / PR ]:** Se crearon Pull Requests (PR #4, PR #5, PR #6) hacia `develop`. Todos cumplieron con la Definition of Done y fueron integrados (Squash and Merge).
5. **[ MERGE & RELEASE ]:** Se realizó el PR final (#7) hacia `main`. Se creó el tag semántico `v1.2.0`, lo que disparó el proceso de Continuous Deployment (CD), publicando un Release oficial en GitHub.

---

## 2. Detalle de los Tickets Implementados

### 🎫 Ticket #1: Filtro por Rango de Fechas en Búsquedas
- **Tipo de Mantenimiento:** Perfectivo (Añade nueva capacidad de filtrado al sistema sin alterar el comportamiento existente).
- **Issue:** #1 | **PR:** #5
- **Problema original:** El endpoint `GET /events` retornaba todos los eventos o filtraba por `source`/`entity`, pero no permitía auditorías temporales (ej. eventos de la última semana).
- **Solución implementada:**
  - Se modificó `events.controller.ts` para aceptar los Query Parameters opcionales `?from=` y `?to=` en formato ISO 8601.
  - Se añadió la validación lógica para rechazar peticiones donde `from > to` devolviendo `400 Bad Request`.
  - Se actualizó el servicio para propagar estos filtros a las consultas sobre las 4 tablas subyacentes.

### 🎫 Ticket #2: Trazabilidad con Correlation ID
- **Tipo de Mantenimiento:** Preventivo (Mejora la observabilidad del sistema para prevenir y agilizar el diagnóstico de fallos futuros en producción).
- **Issue:** #2 | **PR:** #6
- **Problema original:** Al registrar un evento vía `POST /events`, el sistema respondía `{ ok: true }`. En un entorno concurrente, era imposible enlazar la petición del cliente con los logs del servidor.
- **Solución implementada:**
  - Se utilizó `crypto.randomUUID()` para generar un **UUID v4** único por cada petición.
  - Se modificó el tipo de retorno `EventRegistrationResult` para incluir el campo `correlationId`.
  - Se inyectó el UUID en el servicio de Logging (Winston) para que todas las trazas de registro de eventos incluyan este identificador.
  - El cliente ahora recibe: `{ "ok": true, "correlationId": "uuid..." }`.

### 🎫 Ticket #3: Automatización de Pipeline CI/CD y Normativas
- **Tipo de Mantenimiento:** Preventivo / Deuda Técnica (Reduce el riesgo de introducir código defectuoso y elimina el trabajo manual en despliegues).
- **Issue:** #3 | **PR:** #4
- **Problema original:** El repositorio no poseía reglas claras de contribución, ni verificación automatizada de calidad, ni generación de releases.
- **Solución implementada:**
  - Se creó el archivo normativo `CONTRIBUTING.md` delineando explícitamente el uso de Conventional Commits y las definiciones DoR/DoD.
  - Se implementó `.github/workflows/ci.yml` configurando Jobs que instalan dependencias, ejecutan el Linter y los tests en Node.js 20.
  - Se añadió un Job condicional de Release Automático que se ejecuta exclusivamente al pushear tags con formato `v*.*.*`, creando la nota de la versión en GitHub de manera desatendida.

---

## 3. Métricas de Calidad Alcanzadas (Evidencia QA)

El proyecto requería estrictamente superar el 80% de cobertura y presentar código limpio. Los resultados finales obtenidos en el pipeline CI son:

1. **Linting (Calidad Estática):**
   - 0 Errores. Se solucionaron problemas heredados de deuda técnica relacionados a tipos `any` y formateos inseguros de plantillas (restrict-template-expressions).
2. **Testing (Cobertura):**
   - **Total de Tests:** 37 pruebas unitarias implementadas y pasando exitosamente.
   - **Statements:** 100%
   - **Functions:** 100%
   - **Lines:** 100%
   - **Branches (Caminos lógicos):** 87.27%
   - *El umbral mínimo de 80% configurado en Jest fue superado ampliamente.*
3. **Build:**
   - La compilación del framework NestJS finaliza sin errores estructurales ni advertencias del compilador TypeScript.

---

## 4. Conclusión

El Proyecto 02 ha sido completado al 100% cumpliendo los requisitos técnicos y metodológicos. Se ha demostrado dominio sobre el manejo de versionamiento distribuido (Git/GitHub), la resolución de conflictos (Merge Conflicts) durante la integración de las 3 ramas, la escritura de pruebas automatizadas y el diseño de APIs REST robustas y observables.
