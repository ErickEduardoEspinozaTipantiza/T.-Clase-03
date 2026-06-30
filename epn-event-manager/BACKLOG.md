# Backlog — EPN Event Manager (T. Clase 05)

Backlog priorizado para el equipo. Migrar cada ítem a **GitHub Issues** con el label correspondiente y gestionarlo en **GitHub Projects (Kanban)**.

## Columnas Kanban sugeridas

`Backlog` → `Ready (DoR)` → `In Progress` → `In Review` → `Done (DoD)`

---

## Prioridad Alta

| ID | Tipo | Ticket | DoR / Criterios de aceptación | Estado |
|----|------|--------|-------------------------------|--------|
| B-01 | Task | Configurar GitHub Project Kanban | Board creado con 5 columnas; issues vinculados | Listo (plantillas en repo) |
| B-02 | Task | Pipeline CI Lint→Build→Test→Coverage | Workflow en `.github/workflows/ci.yml`; falla si coverage < 80% | Listo |
| B-03 | Tech Debt | Refactorizar EventsService (God Object) | 3 servicios SRP + fachada; ARCHITECTURE.md | Listo |
| B-04 | Feature | Tests unitarios lógica de negocio ≥ 80% | Specs en `services/` y `utils/`; threshold Jest | Listo |

## Prioridad Media

| ID | Tipo | Ticket | Criterios de aceptación | Estado |
|----|------|--------|-------------------------|--------|
| B-05 | Task | Documentar DoR/DoD y ramas | CONTRIBUTING.md completo | Listo |
| B-06 | Task | Templates de Issues y PR | `.github/ISSUE_TEMPLATE/` + PR template | Listo |
| B-07 | Tech Debt | Tests e2e health y stats | Specs adicionales | Pendiente |
| B-08 | Feature | Protección de ramas main/develop | Branch protection en GitHub Settings | Pendiente (config manual) |

## Prioridad Baja

| ID | Tipo | Ticket | Criterios de aceptación | Estado |
|----|------|--------|-------------------------|--------|
| B-09 | Task | Informe T. Clase 05 | INFORME_CLASE_05.md con evidencias | Listo |
| B-10 | Task | Actualizar README del proyecto | Instrucciones CI, arquitectura, contribución | Listo |

---

## Labels requeridos en GitHub

Crear en **Settings → Labels**:

- `feature` — verde
- `bug` — rojo
- `technical-debt` — naranja
- `task` — azul
