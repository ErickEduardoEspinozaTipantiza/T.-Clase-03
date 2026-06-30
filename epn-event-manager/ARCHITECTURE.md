# Arquitectura interna — EPN Event Manager

## Patrón: Arquitectura en Capas (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (Controllers, Guards, Filters)      │
│  events.controller.ts · health.controller.ts            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Application Layer (Fachada + Casos de uso)             │
│  events.service.ts                                      │
│  event-registration.service.ts                          │
│  event-query.service.ts · event-stats.service.ts        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Domain Layer (Reglas y tipos de negocio)               │
│  event-action.enum.ts · event.types.ts                  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Infrastructure Layer (Persistencia, logs, config)      │
│  TypeORM entities · database.module.ts · LoggerService  │
└─────────────────────────────────────────────────────────┘
```

## Responsabilidades por capa

### Presentación
- Recibe HTTP, valida DTOs, aplica guards y traduce errores a respuestas HTTP.
- **No contiene lógica de negocio.**

### Aplicación
- Orquesta casos de uso delegando a servicios especializados (SRP):
  - `EventRegistrationService`: persistir eventos CREATE/UPDATE/DELETE/QUERY
  - `EventQueryService`: consultas y ordenamiento
  - `EventStatsService`: métricas agregadas
- `EventsService` actúa como fachada para no acoplar controladores a múltiples servicios.

### Dominio
- Enum `EventAction`, tipos `EventStatsSummary`, `MergedEventRecord`.
- Utilidades puras en `utils/` (serialización, timestamps).

### Infraestructura
- Repositorios TypeORM, SQLite, Winston logger, variables de entorno.

## Estrategia de logs

| Nivel | Uso en el proyecto |
|-------|---------------------|
| DEBUG | Inicio de operaciones internas (persistencia, consultas) |
| INFO  | Operaciones completadas exitosamente |
| WARN  | Acciones no soportadas, intentos de acceso inválidos |
| ERROR | Excepciones no controladas, fallos de BD |

Los logs se emiten en JSON estructurado (`LoggerService` + Winston).

## Code smells eliminados

| Antes | Después |
|-------|---------|
| `EventsService` monolítico (~160 líneas, 4 repos) | 3 servicios especializados + fachada |
| Bloques duplicados en `registerEvent` | Mapa de handlers por `EventAction` |
| Variables opacas (`ev`, `ta`, `tb`) | Nombres semánticos (`createEvent`, `firstEvent`) |
| Ordenamiento mezclado con consulta | Utilidad `sortEventsByTimestamp` |
