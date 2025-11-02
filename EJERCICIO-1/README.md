# Servidor Web con Express

Servidor simple con Express que incluye dos endpoints: GET y POST.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

## Endpoints

### 1. GET /saludar
Recibe un parámetro `nombre` y devuelve un saludo.

**Ejemplo:**
```bash
curl "http://localhost:3000/saludar?nombre=Juan"
```

**Respuesta:**
```json
{
  "mensaje": "¡Hola, Juan!"
}
```

### 2. POST /mensaje
Recibe un JSON en el body, lo imprime en la consola y devuelve una confirmación.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/mensaje \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "edad": 25, "ciudad": "Madrid"}'
```

**Respuesta:**
```json
{
  "mensaje": "JSON recibido correctamente",
  "datos": {
    "nombre": "Juan",
    "edad": 25,
    "ciudad": "Madrid"
  }
}
```

El JSON también se imprimirá en la consola del servidor.

