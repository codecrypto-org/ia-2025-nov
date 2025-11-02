# PostgreSQL Query Interface - Setup Guide

## Descripción
Esta aplicación web Next.js permite ejecutar consultas SQL contra una base de datos PostgreSQL a través de un MCP (Model Context Protocol) Server.

## Requisitos previos

1. **Base de datos PostgreSQL** ejecutándose en Docker:
   - Puerto: 5454:5432
   - Usuario: postgres
   - Contraseña: postgres
   - Base de datos: northwind

2. **Node.js** versión 18 o superior

## Instalación

### Método 1: Script de inicio automático (Recomendado)

```bash
./scripts/start.sh
```

Este script:
- Verifica que Node.js esté instalado
- Verifica la conexión a PostgreSQL
- Instala las dependencias automáticamente
- Inicia el servidor de desarrollo

### Método 2: Manual

1. Instalar las dependencias:
```bash
npm install
```

2. Asegurarse de que la base de datos PostgreSQL está corriendo:
```bash
docker ps
```

Debería ver un contenedor con PostgreSQL en el puerto 5454.

3. (Opcional) Configurar variables de entorno:
```bash
cp ENV_CONFIG.md .env.local
# Editar .env.local si necesitas cambiar la configuración
```

Ver [ENV_CONFIG.md](ENV_CONFIG.md) para más detalles sobre la configuración.

## Configuración del MCP Server

La aplicación utiliza `@modelcontextprotocol/server-postgres` que se instala automáticamente vía `npx` cuando se ejecuta una consulta. La conexión a la base de datos está configurada en:

```
postgresql://postgres:postgres@localhost:5454/northwind
```

Si necesitas cambiar la configuración de conexión, edita el archivo `app/api/query/route.ts` en la línea donde se define el `StdioClientTransport`.

## Ejecución

### Modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

### Modo producción
```bash
npm run build
npm start
```

## Uso

1. Abre el navegador en http://localhost:3000
2. Verás un textarea con una consulta SQL de ejemplo
3. Puedes modificar la consulta o escribir una nueva
4. Haz clic en "Execute Query" para ejecutarla
5. Los resultados aparecerán en una tabla debajo

### Ejemplos de consultas

```sql
-- Ver todos los clientes (limitado a 10)
SELECT * FROM customers LIMIT 10;

-- Ver productos por categoría
SELECT p.product_name, c.category_name, p.unit_price
FROM products p
JOIN categories c ON p.category_id = c.category_id
ORDER BY p.unit_price DESC;

-- Ver órdenes recientes
SELECT o.order_id, c.company_name, o.order_date, o.shipped_date
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC
LIMIT 20;

-- Total de ventas por cliente
SELECT c.company_name, COUNT(o.order_id) as total_orders
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.company_name
ORDER BY total_orders DESC
LIMIT 10;
```

## Características

- ✅ Interfaz moderna con diseño responsive
- ✅ Soporte para modo oscuro
- ✅ Textarea grande para escribir consultas complejas
- ✅ Resultados mostrados en tabla con scroll horizontal
- ✅ Manejo de errores con mensajes claros
- ✅ Indicador de carga durante la ejecución
- ✅ Valores NULL mostrados explícitamente

## Estructura del proyecto

```
web/
├── app/
│   ├── api/
│   │   └── query/
│   │       └── route.ts          # API endpoint para ejecutar consultas
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal con UI
├── package.json
├── next.config.ts                # Configuración de Next.js
└── tsconfig.json
```

## Solución de problemas

### Error de conexión a la base de datos
- Verifica que el contenedor de Docker esté ejecutándose
- Confirma que el puerto 5454 esté disponible
- Verifica las credenciales en `app/api/query/route.ts`

### Error "Query tool not found"
- El MCP server postgres puede tardar un momento en iniciarse la primera vez
- Intenta ejecutar la consulta nuevamente

### Errores de módulos ES6
- Asegúrate de haber instalado todas las dependencias con `npm install`
- Verifica que la versión de Node.js sea 18 o superior

## Tecnologías utilizadas

- **Next.js 16** - Framework de React
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **MCP SDK** - Cliente para Model Context Protocol
- **PostgreSQL** - Base de datos

