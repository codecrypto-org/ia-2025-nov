# Arquitectura de la Aplicación

## Descripción General

Esta aplicación utiliza **Model Context Protocol (MCP)** como capa de abstracción entre la aplicación y la base de datos PostgreSQL, combinado con **Claude 3.7 Sonnet** para convertir lenguaje natural a SQL.

## Componentes Principales

### 1. Frontend (Next.js + React)

**Archivo:** `app/page.tsx`

- Interfaz de usuario con dos modos: SQL y Lenguaje Natural
- Toggle para cambiar entre modos
- Formulario para escribir consultas
- Tabla responsive para mostrar resultados
- Manejo de estados de carga y errores

### 2. API de Ejecución de Consultas

**Archivo:** `app/api/query/route.ts`

Ejecuta consultas SQL contra PostgreSQL a través del MCP Server.

**Flujo:**
```
Cliente → API Route → MCP Client → MCP Server → PostgreSQL
                                                    ↓
Cliente ← API Route ← MCP Client ← MCP Server ← Resultados
```

**Características:**
- Cliente MCP cacheado para mejor rendimiento
- Manejo de errores robusto
- Formateo automático de resultados
- Health check endpoint (GET)

### 3. API de Conversión Lenguaje Natural a SQL

**Archivo:** `app/api/nl-to-sql/route.ts`

Convierte consultas en lenguaje natural a SQL usando Claude y **introspección dinámica del esquema vía MCP**.

**Flujo:**
```
1. Recibe consulta en lenguaje natural
2. Obtiene esquema de base de datos vía MCP (introspección)
3. Envía consulta + esquema a Claude
4. Claude genera SQL
5. Retorna SQL al cliente
```

#### Introspección Dinámica del Esquema

En lugar de hardcodear el esquema de la base de datos, la aplicación lo obtiene dinámicamente mediante:

**Consultas de Introspección:**

```sql
-- Obtener todas las tablas y columnas
SELECT 
  t.table_name,
  json_agg(
    json_build_object(
      'column_name', c.column_name,
      'data_type', c.data_type,
      'is_nullable', c.is_nullable,
      'column_default', c.column_default
    ) ORDER BY c.ordinal_position
  ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
WHERE t.table_schema = 'public'
GROUP BY t.table_name;

-- Obtener relaciones (foreign keys)
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

**Ventajas de la Introspección Dinámica:**

✅ **Actualización automática**: Si la base de datos cambia, el esquema se actualiza automáticamente  
✅ **Portabilidad**: Funciona con cualquier base de datos PostgreSQL  
✅ **Mantenibilidad**: No hay que actualizar el código cuando cambia el esquema  
✅ **Precisión**: Siempre refleja el estado actual de la base de datos  
✅ **Tipos de datos**: Incluye información completa sobre tipos y constraints  

**Cache del Esquema:**

El esquema se cachea en memoria por **5 minutos** para mejorar el rendimiento:

```typescript
const SCHEMA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
```

Si falla la introspección, hay un **fallback** a un esquema básico.

**Verificar el esquema obtenido:**

```bash
curl http://localhost:3000/api/nl-to-sql
```

Respuesta:
```json
{
  "status": "ok",
  "schema": "Base de datos: PostgreSQL\n\nTablas...",
  "cached": true,
  "cacheAge": 120
}
```

## Model Context Protocol (MCP)

### ¿Qué es MCP?

MCP es un protocolo estándar para conectar aplicaciones con fuentes de datos y herramientas externas. Creado por Anthropic, proporciona una interfaz unificada para interactuar con diferentes sistemas.

### Ventajas de Usar MCP

1. **Abstracción**: Separa la lógica de negocio de la implementación de base de datos
2. **Seguridad**: El MCP Server maneja las conexiones de forma segura
3. **Portabilidad**: Fácil de cambiar a otra base de datos
4. **Estandarización**: Protocolo estándar que funciona con múltiples herramientas
5. **Introspección**: Permite consultar metadatos de la base de datos

### MCP Server de PostgreSQL

**Instalación automática:**
```bash
npx -y @modelcontextprotocol/server-postgres [CONNECTION_STRING]
```

**Herramientas disponibles:**
- `query`: Ejecutar consultas SQL
- `list_tables`: Listar tablas (via introspección)
- `describe_table`: Describir estructura de tabla

## Integración con Claude (Anthropic)

### Modelo Utilizado

**Claude 3.7 Sonnet** (`claude-3-7-sonnet-20250219`)

- Modelo más reciente de Anthropic
- Excelente para tareas de código y razonamiento
- Comprende contexto complejo de bases de datos
- Genera SQL optimizado

### Prompt Engineering

El prompt enviado a Claude incluye:

1. **System Prompt**: Define el rol de Claude como experto en SQL
2. **Esquema de Base de Datos**: Obtenido dinámicamente vía MCP
3. **Reglas**: Instrucciones específicas para generar SQL válido
4. **Consulta del Usuario**: Pregunta en lenguaje natural

**Ejemplo de System Prompt:**

```
Eres un experto en SQL y bases de datos PostgreSQL.

[ESQUEMA OBTENIDO VÍA MCP]

Reglas importantes:
1. Genera SOLO la consulta SQL
2. Usa PostgreSQL syntax
3. Usa LIMIT para limitar resultados
4. Nombres en minúsculas
5. ILIKE para búsquedas case-insensitive
```

### Limpieza del Output

Claude puede devolver el SQL con formato markdown. La aplicación limpia automáticamente:

```typescript
sqlQuery = sqlQuery
  .replace(/^```sql\n?/i, '')
  .replace(/^```\n?/i, '')
  .replace(/\n?```$/i, '')
  .trim();
```

## Flujo Completo: Lenguaje Natural → Resultados

```
1. Usuario escribe: "Muéstrame los 10 clientes con más órdenes"
   ↓
2. Frontend envía a /api/nl-to-sql
   ↓
3. API obtiene esquema vía MCP introspection
   ↓
4. API envía pregunta + esquema a Claude
   ↓
5. Claude genera:
   SELECT c.company_name, COUNT(o.order_id) as total_orders
   FROM customers c
   LEFT JOIN orders o ON c.customer_id = o.customer_id
   GROUP BY c.company_name
   ORDER BY total_orders DESC
   LIMIT 10;
   ↓
6. API devuelve SQL al frontend
   ↓
7. Usuario revisa y confirma
   ↓
8. Frontend envía SQL a /api/query
   ↓
9. API ejecuta via MCP
   ↓
10. PostgreSQL retorna resultados
    ↓
11. Frontend muestra tabla con resultados
```

## Manejo de Errores

### Niveles de Error

1. **Validación de Input**: Query vacía o inválida
2. **API Key Missing**: Falta configurar ANTHROPIC_API_KEY
3. **MCP Connection**: Error al conectar con PostgreSQL
4. **Claude API**: Error en la llamada a Anthropic
5. **SQL Execution**: Error al ejecutar la consulta generada
6. **Schema Introspection**: Error al obtener esquema (fallback disponible)

### Estrategias de Recuperación

- **Cache de esquema**: Reduce fallos por problemas temporales de conexión
- **Fallback de esquema**: Si falla introspección, usa esquema básico
- **Mensajes claros**: Errores descriptivos para el usuario
- **Logs**: Todos los errores se logean en consola

## Performance

### Optimizaciones Implementadas

1. **Cliente MCP Cacheado**: Reutilizado entre requests
2. **Schema Caching**: Esquema en memoria por 5 minutos
3. **LIMIT automático**: Claude agrega LIMIT a consultas sin él
4. **Lazy Connection**: MCP se conecta solo cuando es necesario

### Métricas Típicas

- **Primera consulta NL**: ~3-5 segundos (incluye introspección + Claude)
- **Consultas subsecuentes NL**: ~1-2 segundos (esquema cacheado)
- **Consultas SQL directas**: ~200-500ms
- **Schema introspection**: ~500-1000ms (primera vez)

## Seguridad

### Variables de Entorno

Credenciales sensibles en `.env.local`:
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Sanitización

- MCP Server maneja la sanitización de SQL
- Claude genera SQL seguro (no incluye DROP, DELETE sin WHERE, etc.)
- No se exponen credenciales al cliente

### Rate Limiting

Considera implementar rate limiting en producción para:
- `/api/query`: Prevenir abuse de base de datos
- `/api/nl-to-sql`: Controlar costos de API de Anthropic

## Deployment

### Requisitos

- Node.js 18+
- PostgreSQL 12+ con base de datos Northwind
- API Key de Anthropic Claude

### Variables de Entorno en Producción

```bash
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=production
```

### Consideraciones

- **MCP Server**: Asegúrate de que `npx` funcione en producción
- **Timeouts**: Configura timeouts apropiados para MCP y Claude
- **Logging**: Usa servicios de logging como Datadog o LogRocket
- **Monitoring**: Monitorea llamadas a Claude para controlar costos

## Extensibilidad

### Agregar Nuevas Bases de Datos

1. Cambiar `DATABASE_URL`
2. La introspección se adapta automáticamente
3. Claude genera SQL apropiado para el esquema

### Agregar Nuevos Modelos de IA

El código está diseñado para soportar múltiples proveedores:

```typescript
// Fácil de agregar OpenAI, Cohere, etc.
const model = process.env.AI_PROVIDER === 'openai' 
  ? new OpenAI(...) 
  : new Anthropic(...);
```

### Agregar Más Endpoints

- `/api/nl-to-sql/explain`: Explicar una consulta SQL
- `/api/nl-to-sql/optimize`: Optimizar un SQL existente
- `/api/schema/visualize`: Generar diagrama ER

## Testing

### Testing Manual

```bash
# Verificar esquema
curl http://localhost:3000/api/nl-to-sql

# Health check MCP
curl http://localhost:3000/api/query

# Convertir consulta
curl -X POST http://localhost:3000/api/nl-to-sql \
  -H "Content-Type: application/json" \
  -d '{"query":"Muéstrame los productos más caros"}'
```

### Testing Automatizado

Considera agregar tests para:
- Introspección de esquema
- Conversión de lenguaje natural
- Ejecución de consultas
- Manejo de errores

## Monitoreo y Observabilidad

### Métricas Recomendadas

- Tiempo de respuesta de introspección
- Tasa de éxito de conversión NL→SQL
- Número de llamadas a Claude API (costos)
- Cache hit rate del esquema
- Errores de SQL por query inválido

### Logs Importantes

```typescript
console.log('Schema cache hit:', cached);
console.log('Query execution time:', executionTime);
console.error('MCP connection failed:', error);
```

## Referencias

- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Information Schema](https://www.postgresql.org/docs/current/information-schema.html)

