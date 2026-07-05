# BACKLOG inicial — Proyecto: Tienda de Ropa

Este backlog es el punto de partida para el Taller 5 (Gestión, Clean Coding y Automatización). Cada ticket debe crearse como un *Issue* en GitHub usando las plantillas provistas y seguir la Definition of Ready (DoR).

| ID | Tipo | Repositorio | Título | Prioridad |
|----|------|-------------|--------|-----------|
| CLO-1 | Technical Debt | backend | Unificar entidades `product` y `product_variant` en modelo consistente | Alta |
| CLO-2 | Feature | backend | Búsqueda y filtros por talla/color/categoría en catálogo de productos | Alta |
| CLO-3 | Bug | backend | Precio total del carrito redondea incorrectamente en algunos casos | Alta |
| CLO-4 | Task | frontend | Separar `app.js` en módulos: `state.js`, `api.js`, `render.js`, `utils.js` | Alta |
| CLO-5 | Feature | frontend | Persistencia del carrito (localStorage) y recuperación tras sesión | Media |
| CLO-6 | Task | ambos | Configurar pipeline CI (lint → build → test → coverage) para backend y frontend | Alta |
| CLO-7 | Task | backend | Elevar cobertura de pruebas unitarias al 80% en servicios de negocio | Alta |
| CLO-8 | Bug | frontend | Formato de fecha en fechas de pedido muestra formato local incorrecto | Media |
| CLO-9 | Technical Debt | backend | Refactorizar `orders.service` para extraer responsabilidad de cálculo de impuestos | Media |
| CLO-10 | Feature | backend | Integrar Swagger/OpenAPI para documentación runtime | Media |

> Nota: cada Issue debe incluir descripción, criterios de aceptación y estimación (DoR). Asignar etiquetas `feature`, `bug`, `technical-debt` o `task` según corresponda.
