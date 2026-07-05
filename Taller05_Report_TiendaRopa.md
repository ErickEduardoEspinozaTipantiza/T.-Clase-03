0. Introducción y punto de partida

Este informe constituye la línea base del Taller 05: “Gestión, Clean Coding y Automatización en la Construcción de Software”, adaptado al proyecto real: una Tienda de Ropa formada por un frontend (catálogo, carrito, checkout) y un backend (API REST que gestiona productos, inventario, pedidos y usuarios). El objetivo es planificar y dejar listos los entregables necesarios para llevar el proyecto a un estándar de grado industrial en tres fases: gestión ágil, refactorización con código limpio y automatización mediante pipelines de CI.

Punto de partida técnico
- Repositorio raíz con frontend estático (HTML/CSS/JS) y backend en `epn-event-manager/` (NestJS + TypeORM + SQLite). 
- Tests unitarios iniciales y `jest` configurado; `eslint` configurado. 
- Se añadieron plantillas de Issues/PR y un workflow CI de ejemplo en `epn-event-manager/.github/workflows/ci.yml`.

Alcance de este informe: definir el plan, el backlog inicial y los criterios de calidad (DoR/DoD) para que el equipo ejecute la transformación en PRs pequeñas y trazables.

1. Fase de Gestión y Agilidad (Backlog y Flujos)

Decisión metodológica: Kanban, por el carácter contínuo de trabajo (refactors, mejoras y pruebas). Herramientas: GitHub Projects (tablero Kanban), GitHub Issues y GitHub Actions.

1.1 Herramientas y artefactos mínimos
- Plantillas de Issue y PR en `/.github/` (ya añadidas).
- Backlog inicial en `BACKLOG.md` (raíz) con tickets priorizados.
- Tablero Kanban en GitHub Projects (colocar los issues en columnas Ready / In Progress / PR / Done).

1.2 Tablero Kanban y límites WIP (sugerido)
- Backlog — (no WIP)
- Ready — WIP 6 — criterio: cumple DoR
- In Progress — WIP 4 — criterio: rama `feature/*` creada y propietario asignado
- In Review (PR) — WIP 3 — criterio: PR abierto y pipeline en ejecución
- Done — criterio: cumple DoD

1.3 Backlog inicial (extracto)
Ver archivo `BACKLOG.md`. Ejemplos adaptados al dominio Tienda de Ropa:
- CLO-1 (Technical Debt): Unificar entidades `product` / `product_variant`.
- CLO-2 (Feature): Búsqueda y filtros por talla/color/categoría.
- CLO-3 (Bug): Corrección de redondeo en total del carrito.
- CLO-4 (Task): Modularizar `app.js` en `state.js`, `api.js`, `render.js`, `utils.js`.
- CLO-6 (Task): Configurar pipelines CI (lint → build → test → coverage).

1.4 DoR (Definition of Ready)
Un ticket pasa a Ready si: descripción clara, criterios de aceptación verificables, tipo (Feature/Bug/Technical Debt/Task), estimación y archivos afectados.

1.5 DoD (Definition of Done)
Un ticket se marca Done si: PR aprobado por ≥1 revisor (distinto al autor), pipeline CI en verde (lint/build/tests/coverage), no introduce code smells, y la documentación relevante se actualizó.

1.6 Estrategia de ramas
Convención: `feature/<id>-<slug>`, `fix/<id>-<slug>`, `refactor/<id>-<slug>`, `chore/...`. Prohibir push directo a `main`/`develop` y aplicar branch protection que exija checks y revisión.

2. Fase de Refactorización y Código Limpio (Clean Coding)

Objetivo: reducir deuda técnica y mejorar la mantenibilidad aplicando SRP, nombres explícitos, logging estructurado y pruebas.

2.1 Diagnóstico y hallazgos críticos (Tienda de Ropa)
- `orders.service` (o servicio equivalente): mezcla de cálculo de totales, impuestos, promociones, validación y persistencia → God Method.
- Duplicación `product` / `product_variant`: inconsistencias en precios/stock entre tablas.
- Frontend `app.js`: monolito con render, estado y API; difícil de testar y mantener.
- Endpoints sin sanitización suficiente (posible inyección o inputs inválidos).

2.2 Plan de refactorización (por prioridades)
1) Extraer lógica de precios/impuestos a clases `PriceCalculator`, `TaxCalculator` y probarlas unitariamente.
2) Normalizar modelo de productos y migrar datos según esquema elegido (crear pruebas de integración para migración).
3) Modularizar frontend y añadir validaciones en la UI.
4) Añadir sanitización y validaciones en los controllers (DTOs / class-validator).

2.3 Nombres, medidas y logs
- Estándares: `camelCase` para variables/funciones, `PascalCase` para clases, `kebab-case` para archivos.
- Logging: centralizar con `winston` y usar niveles `DEBUG/INFO/WARN/ERROR`. Evitar `console.log` en nuevo código.

2.4 Pruebas y quality gates
- Meta de cobertura: ≥80% en la lógica de negocio (servicios). Priorizar tests de `PriceCalculator`, `OrderService`, validaciones de carrito y reglas de promoción.
- Añadir pruebas de integración para endpoints críticos (checkout, crear pedido, pagos simulados).

3. Fase de Automatización (Pipelines y Code Review)

3.1 Pipeline CI (esquema)
Cada repo debe tener un `/.github/workflows/ci.yml` que ejecute en `push` y `pull_request`:
1) Lint (`npm run lint`) — fallar en errores de estilo/errores.
2) Build (`npm run build`) — fallar si no compila.
3) Tests (`npm run test`) — correr unitarios y e2e donde aplique.
4) Coverage (`npm run test:cov`) — fallar si los umbrales definidos (<80%).

3.2 Formato de Pull Requests y bloqueo
Usar la plantilla `PULL_REQUEST_TEMPLATE.md`. Configurar branch protection para `main`/`develop`: exigir que CI pase y al menos 1 aprobación distinta al autor.

3.3 Artefactos y medición
- Subir artefacto de cobertura (coverage/) para inspección.
- Registrar métricas de tests y estado de lint en la PR.

4. Plan de ejecución y entregables

4.1 Acciones ya ejecutadas (hoja de ruta lista)
- Plantillas Issues/PR añadidas en `/.github/`.
- Workflow ejemplo añadido en `epn-event-manager/.github/workflows/ci.yml`.
- `BACKLOG.md` y este informe añadidos en la rama `feature/taller05-clothingstore`.

4.2 Siguientes tareas prioritarias (ordenadas)
1) Importar `BACKLOG.md` a GitHub Issues y priorizar en Projects. (Automatizable con `gh`.)
2) Configurar branch protection en `main`/`develop`.
3) Crear PRs pequeños para refactors (ej.: extraer `PriceCalculator`).
4) Aumentar cobertura de servicios a ≥80% con tests unitarios.
5) Replicar/ajustar workflows CI en el frontend si corresponde.

4.3 Entregables finales esperados
- Repositorios con `/.github` (templates + workflows). 
- Tablero Kanban con backlog gestionado. 
- PRs pequeñas con revisión y CI verde. 
- Cobertura de pruebas ≥80% en lógica de negocio. 
- Documentación técnica actualizada (README, Swagger/OpenAPI runtime).

Anexos útiles
- Archivo: `BACKLOG.md` (backlog inicial)
- Comandos locales:
```bash
cd epn-event-manager
npm ci
npm run lint
npm run build
npm run test:cov
```

---

Informe entregado como artefacto en: `feature/taller05-clothingstore`.
