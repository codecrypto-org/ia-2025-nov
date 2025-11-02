# PostgreSQL Query Interface con MCP

Aplicación web Next.js para ejecutar consultas SQL en PostgreSQL a través de Model Context Protocol (MCP).

## 🚀 Inicio Rápido

```bash
# Método recomendado - Script automático
./scripts/start.sh

# O manualmente
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📋 Características

- ✅ **Interfaz moderna** con diseño responsive
- ✅ **Lenguaje Natural** - Escribe consultas en español o inglés (powered by Claude)
- ✅ **Introspección Dinámica** - Esquema de DB obtenido automáticamente vía MCP
- ✅ **Modo SQL** - Textarea grande para escribir consultas SQL complejas
- ✅ **Conversión automática** - Claude convierte lenguaje natural a SQL
- ✅ **Tabla responsive** para visualizar resultados
- ✅ **Manejo de errores** con mensajes claros
- ✅ **Modo oscuro** automático
- ✅ **Estados de carga** con spinners
- ✅ **Conexión MCP** para ejecutar consultas de forma segura

## 📚 Documentación

- **[SETUP.md](SETUP.md)** - Guía completa de instalación y configuración
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura de la aplicación e introspección dinámica
- **[NATURAL_LANGUAGE_EXAMPLES.md](NATURAL_LANGUAGE_EXAMPLES.md)** - Ejemplos de consultas en lenguaje natural
- **[QUERY_EXAMPLES.md](QUERY_EXAMPLES.md)** - Ejemplos de consultas SQL para Northwind
- **[ENV_CONFIG.md](ENV_CONFIG.md)** - Configuración de variables de entorno

## 🏗️ Estructura del Proyecto

```
web/
├── app/
│   ├── api/
│   │   └── query/
│   │       └── route.ts          # API endpoint para ejecutar consultas
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal con UI
├── scripts/
│   └── start.sh                  # Script de inicio automático
├── public/                       # Assets estáticos
├── package.json                  # Dependencias y scripts
├── next.config.ts                # Configuración de Next.js
└── tsconfig.json                 # Configuración de TypeScript
```

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **React 19** - Librería de UI con hooks modernos
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS 4** - Estilos utility-first
- **MCP SDK** - Cliente para Model Context Protocol
- **PostgreSQL** - Base de datos relacional (Northwind)

## 🔧 Configuración

### Base de Datos

La aplicación se conecta a PostgreSQL usando estas credenciales por defecto:

```
Host: localhost
Puerto: 5454
Usuario: postgres
Contraseña: postgres
Base de datos: northwind
```

### Anthropic API Key (Requerido para lenguaje natural)

Para usar el modo de lenguaje natural, necesitas una API key de Anthropic:

1. Obtén tu API key en https://console.anthropic.com/
2. Crea un archivo `.env.local` en el directorio `web/`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
```

**Nota:** Sin la API key, la aplicación funciona pero solo en modo SQL.

Para más detalles, ver [ENV_CONFIG.md](ENV_CONFIG.md).

### MCP Server

El MCP Server de PostgreSQL se instala automáticamente vía `npx` cuando ejecutas la primera consulta. No requiere configuración adicional.

## 📖 Uso

### Modo Lenguaje Natural (Recomendado para principiantes)

1. **Activa el modo "Natural"** usando el toggle en la esquina superior derecha
2. **Escribe tu pregunta** en español o inglés, por ejemplo:
   - "Muéstrame los 10 mejores clientes"
   - "¿Cuántos productos hay por categoría?"
   - "Lista las órdenes del último mes"
3. **Haz clic en "Convertir a SQL"** - Claude generará el SQL automáticamente
4. **Revisa y ejecuta** el SQL generado

### Modo SQL (Para usuarios avanzados)

1. **Escribe tu consulta SQL** en el textarea
2. **Haz clic en "Execute Query"**
3. **Visualiza los resultados** en la tabla responsive

### Ejemplos

**Lenguaje Natural:**
```
Muéstrame los 10 productos más caros
```

**SQL:**
```sql
SELECT * FROM customers LIMIT 10;
```

Ver más ejemplos:
- [NATURAL_LANGUAGE_EXAMPLES.md](NATURAL_LANGUAGE_EXAMPLES.md) - 50+ ejemplos en lenguaje natural
- [QUERY_EXAMPLES.md](QUERY_EXAMPLES.md) - Ejemplos de SQL avanzado

## 🔍 Health Check

La API incluye un endpoint de health check:

```bash
curl http://localhost:3000/api/query
```

Respuesta exitosa:
```json
{
  "status": "ok",
  "message": "MCP server connected",
  "availableTools": ["query"]
}
```

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5454
```
**Solución**: Verifica que el contenedor Docker de PostgreSQL esté ejecutándose:
```bash
docker ps | grep postgres
```

### Error "Query tool not found"
**Solución**: Espera unos segundos e intenta de nuevo. El MCP server puede tardar en iniciarse la primera vez.

### Error de módulos ES6
**Solución**: Asegúrate de tener Node.js 18+ instalado:
```bash
node --version
```

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📝 Scripts Disponibles

```bash
npm run dev      # Modo desarrollo (puerto 3000)
npm run build    # Compilar para producción
npm run start    # Ejecutar versión de producción
npm run lint     # Ejecutar linter
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🙏 Reconocimientos

- Base de datos Northwind de Microsoft
- Model Context Protocol de Anthropic
- Next.js de Vercel
