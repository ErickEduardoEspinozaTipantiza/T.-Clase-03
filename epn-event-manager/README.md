# EPN Event Manager

Backend centralizado para registrar y consultar eventos CRUD emitidos por los sistemas del equipo (NestJS + TypeORM + SQLite).

## Requisitos

- Node.js 22+
- npm 10+

## Configuración rápida

```bash
cp .env.example .env
npm install
npm run start:dev
```

Servidor: `http://localhost:3000`

## Scripts de calidad (T. Clase 05)

```bash
npm run lint          # ESLint
npm run build         # Compilación TypeScript
npm run test          # Pruebas unitarias
npm run test:cov      # Cobertura ≥ 80% en lógica de negocio
```

## Arquitectura

Arquitectura en capas documentada en [ARCHITECTURE.md](./ARCHITECTURE.md):

- **Presentación:** controllers, guards, filters
- **Aplicación:** `EventsService` + servicios especializados (SRP)
- **Dominio:** enums, tipos, utilidades puras
- **Infraestructura:** TypeORM, SQLite, Winston

## Gestión del proyecto

| Documento | Contenido |
|-----------|-----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | DoR, DoD, estrategia de ramas |
| [BACKLOG.md](./BACKLOG.md) | Backlog priorizado del equipo |
| [INFORME_CLASE_05.md](./INFORME_CLASE_05.md) | Informe del taller de industrialización |

## CI/CD

Pipeline en `.github/workflows/ci.yml`:

**Lint → Build → Tests → Coverage Check**

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check con validación de BD |
| POST | `/events` | Registrar evento (CREATE/UPDATE/DELETE/QUERY) |
| GET | `/events` | Listar todos los eventos |
| GET | `/events/source/:source` | Filtrar por source |
| GET | `/events/entity/:entity` | Filtrar por entity |
| GET | `/stats` | Estadísticas agregadas |

Ver [GUIA_EJECUCION.md](./GUIA_EJECUCION.md) para ejemplos con curl.

## Equipo y flujo de trabajo

- Trabajo en ramas `feature/*`, `bugfix/*`, `tech-debt/*`
- Integración vía Pull Request a `develop`
- Merge bloqueado si CI falla o falta revisión de un compañero
