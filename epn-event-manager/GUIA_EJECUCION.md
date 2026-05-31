# Guía de Ejecución y Prueba - EPN Event Manager

## Paso 1: Instalación de Dependencias

```bash
npm install
```

## Paso 2: Iniciar el Servidor

```bash
# Modo desarrollo con watch
npm run start:dev

# O modo producción (después de compilar)
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

---

## Paso 3: Probar los Endpoints

### A. Health Check (Verificar conectividad BD)

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-06T10:30:45.123Z",
  "database": "connected"
}
```

---

### B. Registrar Evento CREATE

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "sistema-pedidos",
    "entity": "pedido",
    "action": "CREATE",
    "title": "Nuevo pedido creado",
    "description": "Pedido #P001 de cliente María García",
    "payload": {
      "id": "P001",
      "customer": "María García",
      "amount": 150.50
    }
  }'
```

---

### C. Registrar Evento UPDATE

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "sistema-pedidos",
    "entity": "pedido",
    "action": "UPDATE",
    "title": "Pedido actualizado",
    "description": "Estado cambió a preparación",
    "payload": {
      "id": "P001",
      "status": "preparation"
    }
  }'
```

---

### D. Registrar Evento DELETE (El Bug Que Fue Corregido)

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "sistema-pedidos",
    "entity": "pedido",
    "action": "DELETE",
    "title": "Pedido cancelado",
    "description": "Pedido #P001 cancelado por cliente",
    "payload": {
      "id": "P001"
    }
  }'
```

**Antes de la corrección**: El evento retornaba `{ ok: true }` pero NO se guardaba.
**Después de la corrección**: El evento se guarda correctamente en BD.

---

### E. Registrar Evento QUERY

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "sistema-pedidos",
    "entity": "pedido",
    "action": "QUERY",
    "title": "Consulta de pedidos",
    "description": "Cliente consultó sus pedidos",
    "payload": {
      "customer_id": "C001"
    }
  }'
```

---

### F. Obtener Todos los Eventos

```bash
curl http://localhost:3000/events
```

**Respuesta**: Array de eventos ordenados por timestamp ISO (ascendente).

---

### G. Filtrar por Source

```bash
curl http://localhost:3000/events/source/sistema-pedidos
```

---

### H. Filtrar por Entity

```bash
curl http://localhost:3000/events/entity/pedido
```

---

### I. Obtener Estadísticas (Ahora incluye query_events)

```bash
curl http://localhost:3000/stats
```

**Respuesta esperada (DESPUÉS de la corrección):**
```json
{
  "create": 5,
  "update": 3,
  "delete": 2,
  "query": 4,
  "total": 14
}
```

**Antes**: No incluía `query` ni lo sumaba al `total`. Ahora está completo.

---

## Paso 4: Probar Validaciones (Mantenimiento Preventivo)

### Intentar enviar title demasiado largo (Debe fallar)

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "test",
    "entity": "test",
    "action": "CREATE",
    "title": "'$(python -c 'print("x"*300)')'",
    "payload": {}
  }'
```

**Respuesta esperada:** Error 400 (Bad Request) - string excede MaxLength(255)

### Intentar enviar source vacío (Debe fallar)

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "source": "",
    "entity": "test",
    "action": "CREATE",
    "title": "Test",
    "payload": {}
  }'
```

**Respuesta esperada:** Error 400 - field is required

---

## Verificar Cambios Implementados

### 1. **Correctivo**: Bug DELETE corregido
- ✅ Envía un DELETE event
- ✅ Verifica con `GET /events` que aparece en el historial
- ✅ Verifica en la BD que está en tabla `delete_events`

### 2. **Adaptativo**: Fechas en ISO 8601
- ✅ Todos los eventos tienen timestamps formato `"2026-05-06T10:30:45.123Z"`
- ✅ No usa formato local like `"5/6/2026, 10:30:45 AM"`

### 3. **Perfectivo**: Stats incluye query_events
- ✅ `GET /stats` retorna 5 campos: `create`, `update`, `delete`, `query`, `total`
- ✅ El total = sum(create + update + delete + query)

### 4. **Preventivo**: Validaciones activas
- ✅ POST /events rechaza payloads sin campos requeridos
- ✅ POST /events rechaza strings que exceden MaxLength
- ✅ GET /health verifica conexión real a BD

---

## Estructura de Base de Datos

El proyecto usa SQLite. Verifica las tablas:

```bash
# Conectar a BD
sqlite3 db/events.sqlite

# Listar tablas
.tables

# Ver estructura de tabla
.schema create_events
.schema update_events
.schema delete_events
.schema query_events

# Contar registros
SELECT COUNT(*) FROM create_events;
SELECT COUNT(*) FROM update_events;
SELECT COUNT(*) FROM delete_events;
SELECT COUNT(*) FROM query_events;
```

---

## Integración con tu CRUD Personal

En tu sistema de **Gestión de Pedidos**, cada operación debe enviar un evento al Event Manager:

### Ejemplo: Crear Pedido
```javascript
async function crearPedido(dataPedido) {
  // 1. Guardar en tu BD
  const pedido = await guardarEnBD(dataPedido);

  // 2. Enviar evento al Event Manager
  await fetch('http://localhost:3000/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'sistema-pedidos',
      entity: 'pedido',
      action: 'CREATE',
      title: `Pedido ${pedido.id} creado`,
      description: `Cliente ${pedido.customer} hizo un pedido`,
      payload: pedido
    })
  });

  return pedido;
}
```

---

## Archivos Modificados

Ver `MANTENIMIENTO_APLICADO.md` para detalle completo de cambios.

### Resumen de Cambios:
1. `src/modules/events/events.service.ts` - Correctivo, Adaptativo, Perfectivo
2. `src/modules/events/dto/create-event.dto.ts` - Preventivo
3. `src/main.ts` - Preventivo
4. `src/modules/health/health.controller.ts` - Preventivo
5. `src/database/entities/delete-event.entity.ts` - Estructural

---

## Troubleshooting

### Puerto 3000 en uso
```bash
npm run start:dev -- --port 3001
```

### Errores de BD
Elimina y recrea la BD:
```bash
rm -rf db/events.sqlite
npm run start:dev
```

### Validaciones no funcionan
Verifica que `npm install` instaló `class-validator`

---

## Próximos Pasos para la Sustentación

1. **Ejecuta el servidor**: `npm run start:dev`
2. **Envía eventos de prueba** desde tu CRUD de pedidos
3. **Verifica** que aparecen en `GET /events`
4. **Prueba** cada tipo de mantenimiento según `MANTENIMIENTO_APLICADO.md`
5. **Documenta** screenshots de antes/después
6. **Presenta** los 4 tipos de mantenimiento aplicados
