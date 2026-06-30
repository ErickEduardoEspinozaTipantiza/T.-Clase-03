# Informe T. Clase 05 — Industrialización del EPN Event Manager

**Proyecto:** EPN Event Manager  
**Repositorio:** [T.-Clase-03](https://github.com/ErickEduardoEspinozaTipantiza/T.-Clase-03)  
**Rama de trabajo:** `feature/clase-05-industrializacion`  
**Fecha:** 29 de junio de 2026  
**Integrantes:** Equipo EPN Event Manager (hasta 4 personas)

---

## 1. Resumen ejecutivo

Este informe documenta la industrialización del backend **EPN Event Manager** según los requisitos del taller **T. Clase 05: Gestión, Clean Coding y Automatización**. Se aplicaron metodologías ágiles (backlog, DoR/DoD, feature branches), refactorización profunda con arquitectura en capas, logs estructurados, pruebas automatizadas con umbral de cobertura, y un pipeline CI en GitHub Actions.

**Resultado:** el proyecto pasó de ~43% de cobertura global a **>99% en la lógica de negocio del módulo events**, con pipeline automatizado Lint → Build → Tests → Coverage.

---

## 2. Fase 1 — Gestión y agilidad

### 2.1 Backlog estructurado

El backlog priorizado está en [`BACKLOG.md`](./BACKLOG.md) con tickets clasificados en:

| Tipo | Label GitHub | Ejemplo |
|------|--------------|---------|
| Feature | `feature` | Tests unitarios ≥ 80% |
| Bug | `bug` | Corrección de regresiones |
| Technical Debt | `technical-debt` | Refactor God Object EventsService |
| Task | `task` | Configuración CI/CD, documentación |

**Acción pendiente manual en GitHub:** crear el **GitHub Project (Kanban)** con columnas: Backlog → Ready → In Progress → In Review → Done, e importar los ítems de `BACKLOG.md`.

### 2.2 Definition of Ready (DoR)

Documentado en [`CONTRIBUTING.md`](./CONTRIBUTING.md). Un ticket solo inicia si tiene:

- Descripción clara del objetivo
- Criterios de aceptación verificables
- Label de tipo asignado
- Prioridad definida en el backlog

### 2.3 Definition of Done (DoD)

Un ticket solo se cierra si:

- [x] Código revisado en Pull Request
- [x] Pipeline CI verde (lint, build, tests, coverage)
- [x] Sin code smells críticos nuevos
- [x] Documentación actualizada

### 2.4 Estrategia de ramas

| Rama | Uso |
|------|-----|
| `main` | Producción estable — **sin push directo** |
| `develop` | Integración del equipo — **sin push directo** |
| `feature/*` | Nuevas funcionalidades |
| `bugfix/*` | Corrección de bugs |
| `tech-debt/*` | Refactorización |

**Flujo implementado:** `feature/clase-05-industrializacion` → PR hacia `develop`.

**Acción pendiente manual:** activar **Branch protection rules** en GitHub (Settings → Branches) para `main` y `develop`: require PR, require status checks, require 1 approval.

### 2.5 Templates de Issues y PR

Ubicación en el repositorio:

```
.github/
├── ISSUE_TEMPLATE/
│   ├── feature.yml
│   ├── bug.yml
│   ├── technical-debt.yml
│   ├── task.yml
│   └── config.yml
├── pull_request_template.md
└── workflows/
    └── ci.yml
```

---

## 3. Fase 2 — Refactorización y código limpio

### 3.1 Problema inicial (code smells)

| Code smell | Ubicación original | Impacto |
|------------|-------------------|---------|
| **God Object** | `EventsService` (~160 líneas, 4 repos) | Difícil de testear y mantener |
| **Duplicación** | 4 bloques casi idénticos en `registerEvent` | Riesgo de regresiones (ej. bug DELETE) |
| **Nombres opacos** | `ev`, `ta`, `tb` | Baja legibilidad |
| **Responsabilidades mezcladas** | Persistencia + consultas + stats en una clase | Viola SRP |

### 3.2 Arquitectura en capas aplicada

Documentación completa en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

```
Presentación     → events.controller.ts, guards, filters
Aplicación       → EventsService (fachada)
                 → EventRegistrationService
                 → EventQueryService
                 → EventStatsService
Dominio          → event-action.enum.ts, event.types.ts
                 → utils/ (payload, timestamps)
Infraestructura  → TypeORM entities, LoggerService, SQLite
```

### 3.3 Refactorizaciones realizadas

#### Antes — God Object monolítico

```typescript
// events.service.ts (simplificado)
async registerEvent(dto) {
  if (action === 'CREATE') { /* 15 líneas */ }
  if (action === 'UPDATE') { /* 15 líneas */ }
  if (action === 'DELETE') { /* 15 líneas */ }
  if (action === 'QUERY')  { /* 15 líneas */ }
}
```

#### Después — SRP + Strategy por acción

```typescript
// event-registration.service.ts
const persistenceHandlers: Record<EventAction, () => Promise<void>> = {
  [EventAction.CREATE]: () => this.saveCreateEvent(...),
  [EventAction.UPDATE]: () => this.saveUpdateEvent(...),
  [EventAction.DELETE]: () => this.saveDeleteEvent(...),
  [EventAction.QUERY]:  () => this.saveQueryEvent(...),
};
await persistenceHandlers[action]();
```

**Servicios creados:**

| Servicio | Responsabilidad única |
|----------|----------------------|
| `EventRegistrationService` | Persistir eventos por acción |
| `EventQueryService` | Consultas y ordenamiento |
| `EventStatsService` | Métricas agregadas |
| `EventsService` | Fachada de aplicación |

### 3.4 Logs estructurados

Implementados con **Winston** en `LoggerService` (JSON + niveles):

| Nivel | Uso |
|-------|-----|
| **DEBUG** | Inicio de persistencia/consultas |
| **INFO** | Operaciones completadas |
| **WARN** | Acciones no soportadas, accesos inválidos |
| **ERROR** | Excepciones y fallos de BD |

Ejemplo de log estructurado:

```json
{
  "timestamp": "2026-06-29 10:00:00 -05:00",
  "level": "INFO",
  "message": "Evento persistido correctamente",
  "context": "EventRegistrationService",
  "action": "CREATE",
  "source": "crud-planetas"
}
```

### 3.5 Pruebas y cobertura

**Antes del taller:**

| Métrica | Valor |
|---------|-------|
| Cobertura global | 43.3% |
| `events.service.ts` | 15.87% |
| Test suites | 2 |

**Después del taller (lógica de negocio — `modules/events/`):**

| Métrica | Valor |
|---------|-------|
| Statements | **99.27%** |
| Lines | **99.22%** |
| Functions | **97.22%** |
| Branches | 78.04% |
| Test suites | **9** |
| Tests | **35** |

**Archivos de prueba añadidos:**

- `event-registration.service.spec.ts`
- `event-query.service.spec.ts`
- `event-stats.service.spec.ts`
- `events.service.spec.ts`
- `event-action.enum.spec.ts`
- `event-payload.util.spec.ts`
- `event-timestamp.util.spec.ts`

**Umbral CI configurado** en `package.json`:

```json
"coverageThreshold": {
  "global": {
    "statements": 80,
    "lines": 80,
    "functions": 80
  }
}
```

> El umbral exige ≥ 80% en statements, lines y functions sobre la lógica de negocio del módulo `events`, excluyendo controllers, DTOs y modules.

---

## 4. Fase 3 — Automatización y code review

### 4.1 Pipeline CI

Archivo: `.github/workflows/ci.yml`

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────────┐
│  Lint    │ → │  Build   │ → │  Tests   │ → │ Coverage ≥ 80%  │
│ eslint   │   │ nest build│  │ jest     │   │ test:cov        │
└──────────┘   └──────────┘   └──────────┘   └─────────────────┘
```

**Trigger:** push y pull_request en `main`, `develop`, `feature/**`, `bugfix/**`, `tech-debt/**`.

### 4.2 Formato de Pull Request

Template en `.github/pull_request_template.md` con:

- Tipo de cambio (Feature/Bug/Tech Debt/Task)
- Checklist DoD
- Evidencia de CI
- Notas para revisores

### 4.3 Política de merge

- Merge bloqueado si CI falla
- Requiere aprobación de al menos 1 compañero (configurar en Branch protection)

---

## 5. Evidencias de ejecución local

Comandos ejecutados exitosamente:

```bash
cd epn-event-manager
npm run lint    # 0 errores (27 warnings preexistentes)
npm run build   # Compilación OK
npm run test:cov # 35 tests passed, coverage gate OK
```

---

## 6. Matriz de cumplimiento del taller

| Criterio del taller | Estado | Evidencia |
|---------------------|--------|-----------|
| Backlog con tickets tipificados | ✅ | `BACKLOG.md` + issue templates |
| DoR / DoD | ✅ | `CONTRIBUTING.md` |
| Feature branches | ✅ | Rama `feature/clase-05-industrializacion` |
| Arquitectura en capas | ✅ | `ARCHITECTURE.md` + refactor |
| Logs estructurados DEBUG–ERROR | ✅ | `LoggerService` + servicios |
| Cobertura ≥ 80% lógica de negocio | ✅ | 99% statements/lines |
| Eliminar God Objects | ✅ | 3 servicios + fachada |
| CI Lint→Build→Test→Coverage | ✅ | `.github/workflows/ci.yml` |
| PR formal con revisión | ✅ | PR template + flujo documentado |

---

## 7. Trabajo pendiente manual (GitHub UI)

Estos ítems requieren configuración en la interfaz de GitHub (no automatizable desde código):

1. Crear labels: `feature`, `bug`, `technical-debt`, `task`
2. Crear GitHub Project Kanban e importar backlog
3. Activar branch protection en `main` y `develop`
4. Solicitar revisión de un compañero en el PR de esta rama

---

## 8. Conclusiones

El EPN Event Manager evolucionó de un backend funcional con deuda técnica educativa a un proyecto con **estándar industrial**:

1. **Gestión:** backlog, DoR/DoD, templates y flujo GitFlow documentado.
2. **Calidad:** arquitectura en capas, SRP, eliminación del God Object, logs estructurados.
3. **Automatización:** CI completo que impide integrar código sin pasar lint, build, tests y coverage.

La industrialización no solo mejora la calidad del código, sino que **institucionaliza** la calidad mediante procesos repetibles y automatizados — objetivo central del taller de Construcción de Software.

---

## 9. Referencias

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Diagrama de capas
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — DoR, DoD, ramas
- [`BACKLOG.md`](./BACKLOG.md) — Backlog del equipo
- [`MANTENIMIENTO_APLICADO.md`](./MANTENIMIENTO_APLICADO.md) — Taller anterior (Clase 03/04)
- [`GUIA_EJECUCION.md`](./GUIA_EJECUCION.md) — Pruebas manuales con curl
