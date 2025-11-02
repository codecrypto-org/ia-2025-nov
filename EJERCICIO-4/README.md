# Acceso a Base de Datos con MCP

Aplicación web para ejecutar consultas SQL en PostgreSQL a través de Model Context Protocol (MCP).

## Arquitectura

Una base de datos PostgreSQL conectada a un MCP Server que se encarga de ejecutar las consultas y devolver los resultados.

### Componentes

- **Base de datos**: PostgreSQL en Docker
  - Puerto: `5454:5432`
  - Usuario: `postgres`
  - Contraseña: `postgres`
  - Base de datos: `northwind`

- **MCP Server**: `@modelcontextprotocol/server-postgres`
  - Se ejecuta automáticamente vía `npx`
  - Maneja las consultas SQL de forma segura

- **Web App**: Next.js 16 (directorio `/web`)
  - Interfaz moderna con Tailwind CSS
  - TypeScript para tipado estático
  - API Routes para comunicación con MCP

## Modelo LLM

Claude 3.7 Sonnet (Anthropic)

```json
{
  "model": "claude-3-7-sonnet-20250219",
  "provider": "anthropic",
  "api_key": "sk-ant-api03-1234567890"
}
```

## Funcionalidades

✅ **Interfaz web completa** con:
- **Modo Lenguaje Natural** - Escribe consultas en español o inglés (powered by Claude 3.7 Sonnet)
- **Modo SQL** - Textarea grande para escribir consultas SQL
- Conversión automática de lenguaje natural a SQL
- Botón para ejecutar consultas
- Tabla responsive para mostrar resultados
- Manejo de errores
- Modo oscuro
- Estados de carga

## Inicio Rápido

### 1. Iniciar la base de datos

Asegúrate de que tu contenedor PostgreSQL esté corriendo en el puerto 5454.

### 2. Instalar dependencias

```bash
cd web
npm install
```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

### 4. (Opcional) Configurar API Key de Anthropic

Para usar el modo de lenguaje natural:

```bash
cd web
echo "ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui" > .env.local
```

Obtén tu API key en https://console.anthropic.com/

### 5. Ejecutar consultas

**Modo Lenguaje Natural:**
- Activa el toggle "Natural" en la esquina superior derecha
- Escribe tu pregunta: "Muéstrame los 10 mejores clientes"
- Haz clic en "Convertir a SQL"

**Modo SQL:**
- Escribe tu consulta SQL en el textarea
- Haz clic en "Execute Query"

Los resultados se mostrarán en una tabla.

## Documentación Adicional

Ver [web/SETUP.md](web/SETUP.md) para instrucciones detalladas de instalación y uso.

## Ejemplos de Consultas

### Lenguaje Natural

```
Muéstrame los 10 productos más caros
```

```
¿Cuántos clientes hay por país?
```

```
Lista los mejores clientes por volumen de compras
```

Ver más en [web/NATURAL_LANGUAGE_EXAMPLES.md](web/NATURAL_LANGUAGE_EXAMPLES.md)

### SQL

```sql
-- Ver todos los clientes
SELECT * FROM customers LIMIT 10;

-- Productos por categoría
SELECT p.product_name, c.category_name, p.unit_price
FROM products p
JOIN categories c ON p.category_id = c.category_id
ORDER BY p.unit_price DESC;
```

Ver más en [web/QUERY_EXAMPLES.md](web/QUERY_EXAMPLES.md)

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **IA**: Anthropic Claude 3.7 Sonnet (para lenguaje natural)
- **MCP**: Model Context Protocol SDK
- **Base de datos**: PostgreSQL (Northwind)
- **Container**: Docker

