const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON en el body de las peticiones POST
app.use(express.json());

// Endpoint GET /saludar
// Recibe un parámetro "nombre" como query parameter
// Ejemplo: http://localhost:3000/saludar?nombre=Juan
app.get('/saludar', (req, res) => {
  const nombre = req.query.nombre;
  
  if (!nombre) {
    return res.status(400).json({ 
      error: 'El parámetro "nombre" es requerido' 
    });
  }
  
  res.json({ 
    mensaje: `¡Hola, ${nombre}!` 
  });
});

// Endpoint POST /mensaje
// Recibe un JSON en el body y lo imprime en la consola
app.post('/mensaje', (req, res) => {
  const jsonRecibido = req.body;
  
  console.log('JSON recibido:');
  console.log(jsonRecibido);
  
  res.json({ 
    mensaje: 'JSON recibido correctamente',
    datos: jsonRecibido 
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  GET  http://localhost:${PORT}/saludar?nombre=TuNombre`);
  console.log(`  POST http://localhost:${PORT}/mensaje`);
});

