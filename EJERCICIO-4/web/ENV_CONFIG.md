# Configuración de Variables de Entorno

## Variables de Entorno Disponibles

### DATABASE_URL

Cadena de conexión a la base de datos PostgreSQL.

**Formato:**
```
postgresql://usuario:contraseña@host:puerto/basedatos
```

**Valor por defecto:**
```
postgresql://postgres:postgres@localhost:5454/northwind
```

**Uso:**

Si necesitas conectarte a una base de datos diferente, puedes crear un archivo `.env.local` en el directorio `web/`:

```bash
# web/.env.local
DATABASE_URL=postgresql://mi_usuario:mi_password@mi_host:5432/mi_base_datos
```

### ANTHROPIC_API_KEY

API key de Anthropic Claude para convertir lenguaje natural a SQL.

**Requerido:** Sí (para usar el modo de lenguaje natural)

**Formato:**
```
sk-ant-api03-xxxxxxxxxxxxx
```

**Cómo obtener tu API key:**

1. Visita https://console.anthropic.com/
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Crea una nueva API key
5. Copia la key (empieza con `sk-ant-`)

**Uso:**

```bash
# web/.env.local
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
```

**Nota:** Sin esta key, la aplicación funcionará pero el modo de lenguaje natural no estará disponible. Solo podrás ejecutar consultas SQL directamente.

### PORT

Puerto en el que se ejecutará el servidor de desarrollo.

**Valor por defecto:** `3000`

**Uso:**

```bash
# web/.env.local
PORT=8080
```

Luego ejecuta:
```bash
npm run dev -- -p $PORT
```

## Ejemplo Completo

Crear archivo `web/.env.local`:

```bash
# Conexión a base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5454/northwind

# API key de Anthropic Claude (requerido para lenguaje natural)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# Puerto del servidor
PORT=3000

# Modo de desarrollo
NODE_ENV=development
```

## Notas Importantes

1. **Nunca** agregues archivos `.env` o `.env.local` al control de versiones
2. Los valores en `.env.local` sobrescriben los valores por defecto
3. Si cambias las variables de entorno, necesitas reiniciar el servidor de desarrollo
4. La cadena de conexión debe ser accesible desde el entorno donde se ejecuta Next.js

## Seguridad

Para producción, usa variables de entorno del sistema o servicios de configuración como:
- Vercel Environment Variables
- AWS Systems Manager Parameter Store
- HashiCorp Vault
- Variables de entorno del sistema operativo

No incluyas credenciales sensibles en el código fuente.

