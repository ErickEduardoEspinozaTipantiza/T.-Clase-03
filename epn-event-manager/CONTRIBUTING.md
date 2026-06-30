# Guía de contribución — EPN Event Manager

## Estrategia de ramas (Feature Branch Workflow)

| Rama | Propósito |
|------|-----------|
| `main` | Código estable en producción. **Prohibido push directo.** |
| `develop` | Integración continua del equipo. **Prohibido push directo.** |
| `feature/*` | Nuevas funcionalidades |
| `bugfix/*` | Corrección de errores |
| `tech-debt/*` | Refactorización y deuda técnica |

### Flujo obligatorio

1. Crear rama desde `develop`: `git checkout -b feature/mi-cambio develop`
2. Implementar cambios con commits descriptivos
3. Abrir Pull Request hacia `develop`
4. Esperar CI verde y al menos **1 revisión** de un compañero
5. Merge solo cuando se cumpla el Definition of Done

## Tipos de tickets (Issues)

| Label | Uso |
|-------|-----|
| `feature` | Nuevas funcionalidades |
| `bug` | Corrección de errores |
| `technical-debt` | Refactorización y deuda técnica |
| `task` | Documentación, investigación o configuración |

## Definition of Ready (DoR)

Un ticket **solo entra a desarrollo** si incluye:

- [ ] Descripción clara del problema u objetivo
- [ ] Criterios de aceptación verificables
- [ ] Tipo de ticket asignado (`feature`, `bug`, `technical-debt`, `task`)
- [ ] Estimación o prioridad definida en el backlog
- [ ] Dependencias identificadas (si aplica)

## Definition of Done (DoD)

Un ticket **solo se cierra** si:

- [ ] El código fue revisado en Pull Request por al menos un compañero
- [ ] El pipeline CI pasó: Lint → Build → Tests → Coverage ≥ 80% (lógica de negocio)
- [ ] No hay code smells críticos introducidos
- [ ] La funcionalidad está documentada (README, comentarios de arquitectura o informe)
- [ ] Los criterios de aceptación del ticket están cumplidos

## Comandos locales antes de abrir PR

```bash
cd epn-event-manager
npm run lint
npm run build
npm run test:cov
```
