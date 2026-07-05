0. Introducción y Punto de Partida

Este informe constituye la línea base del taller “Gestión, Clean Coding y Automatización en la Construcción de Software”, adaptado al proyecto actual: una Tienda de Ropa con frontend (interfaz CRUD de catálogo, carrito y checkout) y backend (API REST con Node/NestJS o equivalente). El objetivo es elevar el proyecto hasta un estándar de grado industrial en tres fases: gestión ágil del backlog, refactorización con principios de código limpio, y automatización mediante CI.

Punto de partida: el repositorio contiene un frontend de tienda (HTML/CSS/JS) y un backend (API REST) con algunos tests iniciales. Se han añadido plantillas de Issues/PR y un workflow CI básico en el repositorio padre y en el subdirectorio `epn-event-manager` como ejemplo operativo; ahora adaptamos el plan al dominio Tienda de Ropa.

1. Fase de Gestión y Agilidad (Backlog y Flujos)

Se adopta Kanban para visualizar el flujo continuo de trabajo (refactors, features, tests, CI). Herramienta: GitHub Projects + GitHub Issues + GitHub Actions.

1.1 Herramienta de gestión

Usar GitHub Projects (tablero Kanban) y GitHub Issues. Las plantillas de Issue ya están disponibles en `/.github/ISSUE_TEMPLATE/`.

1.2 Tablero Kanban (columnas y WIP)

Columna | Límite WIP | Criterio de entrada
---|---:|---
Backlog | — | Ticket creado y priorizado
Listo (Ready) | 6 | Cumple DoR
En progreso | 4 | Rama feature creada, integrante asignado
En revisión (PR) | 3 | PR abierto y pipeline en ejecución
Hecho (Done) | — | Cumple DoD

1.3 Backlog estructurado

Ver [BACKLOG.md](BACKLOG.md) en la raíz del proyecto para el backlog inicial (CLO-1..CLO-10). Estos Issues deben importarse a GitHub Issues y priorizarse.

1.4 Políticas de calidad en el flujo

Definition of Ready (DoR): descripción clara, criterios de aceptación verificables, tipo de ticket, estimación y archivos afectados.

Definition of Done (DoD): PR revisado por al menos 1 compañero, pipeline CI verde (lint, build, tests, coverage), no introducir code smells nuevos y documentación actualizada.

1.5 Estrategia de ramas

Feature branches estrictas: `feature/<id-ticket>-<slug>`, `fix/...`, `refactor/...`, `chore/...`. Push directo a `main`/`develop` prohibido y reforzado con branch protection (exigir checks y 1 aprobación).

2. Fase de Refactorización y Código Limpio (Clean Coding)

2.1 Understandability y nombrado

Identificar funciones/métodos con múltiples responsabilidades (God Methods) en servicios de negocio: por ejemplo `orders.service` que calcula totales, impuestos, aplica promociones y persiste pedidos. Plan: extraer responsabilidades en funciones privadas o clases `Calculator/Taxes/Promotions` y escribir pruebas unitarias para cada uno.

2.2 Arquitectura y estructuras

Formalizar arquitectura en capas (Controller → Service → Repository/Entity). Garantizar controladores sin lógica de negocio; servicios centrados en reglas; repositorios únicamente acceso a datos mediante DAOs/ORM.

2.3 Estrategia de logs

Usar logger central (p. ej. `winston`) con niveles: `DEBUG` (detalles internos), `INFO` (acciones exitosas), `WARN` (anomalías no bloqueantes), `ERROR` (excepciones). Prohibir `console.log` en nuevo código.

2.4 Pruebas y eliminación de code smells

Objetivo: >=80% de cobertura en la lógica de negocio (servicios). Priorizar pruebas para: cálculo de totales/IVA/descuentos, gestión de inventario, creación de pedidos y validaciones de borde (precio negativo, stock insuficiente). Identificados code smells (ejemplos): God Methods en `orders.service`, duplicación entre `product` y `variant`, falta de sanitización en endpoints públicos.

3. Fase de Automatización (Pipelines y Code Review)

3.1 Pipeline de Integración Continua

Cada repositorio tendrá un workflow GitHub Actions que ejecute en `push` y `pull_request`: `lint → build → test → coverage`. El pipeline añadido en `epn-event-manager/.github/workflows/ci.yml` sirve como plantilla; crear una versión equivalente para el repositorio de la tienda de ropa en `/.github/workflows/ci.yml`.

3.2 Formato de Pull Requests y Code Review

Usar la plantilla `PULL_REQUEST_TEMPLATE.md`. Requerir en reglas de protección: pasar CI y 1 aprobación de revisor.

3.3 Cobertura y umbrales

Configurar `jest` (o herramienta equivalente) para exigir 80% en `statements`, `lines` y `functions`. Recomendar también elevar branches si es factible.

4. Próximos Pasos (Plan de trabajo ejecutable)

4.1 Acciones inmediatas realizadas

- Añadí plantillas de Issues y PR en `/.github/ISSUE_TEMPLATE/` y `/.github/PULL_REQUEST_TEMPLATE.md` (raíz y dentro de `epn-event-manager`).
- Añadí un workflow CI básico en `epn-event-manager/.github/workflows/ci.yml` y copié una versión al directorio raíz de la tienda (si aplica) como plantilla.
- Creé `BACKLOG.md` con 10 tickets iniciales adaptados a la Tienda de Ropa.
- Generé este informe `Taller05_Report_TiendaRopa.md` en la raíz del proyecto.

4.2 Acciones recomendadas (ordenadas por prioridad)

1. Importar los Issues del `BACKLOG.md` a GitHub Issues y priorizarlos en GitHub Projects. (Ejecución manual o mediante `gh` CLI). 
2. Configurar branch protection en `main`/`develop` para exigir checks y revisiones. 
3. Implementar en PRs pequeños las correcciones de Clean Code (ej. extraer cálculo de impuestos), acompañadas de tests unitarios antes de cambiar comportamiento. 
4. Completar workflows CI en ambos repositorios y asegurar que fallen si la cobertura baja de 80%. 
5. Documentar el uso del logger y la convención de nombres en `README.md` o `MANTENIMIENTO_APLICADO.md`.

4.3 Entregables finales esperados

- Repositorio organizado con `/.github` (templates + workflows). 
- Tablero Kanban con backlog priorizado y tickets en progreso. 
- PRs pequeñas con revisión y CI pasando. 
- Cobertura de pruebas >= 80% en servicios de negocio. 
- Documentación técnica (README, Swagger/OpenAPI runtime) y `MANTENIMIENTO_APLICADO.md` actualizado.

Anexo: archivos añadidos en esta rama

- `BACKLOG.md` — backlog inicial (ver arriba)
- `Taller05_Report_TiendaRopa.md` — informe base para Taller 5

---

El informe anterior es la versión inicial y ejecutable. Si confirmas que el dominio correcto es la Tienda de Ropa, procederé ahora a: crear una rama `feature/taller05-clothingstore`, commitear `BACKLOG.md` y `Taller05_Report_TiendaRopa.md`, y pushear la rama al remoto para que abras el PR. También puedo crear los Issues automáticamente en GitHub si me autorizas a usar `gh` CLI (requiere autenticación).
