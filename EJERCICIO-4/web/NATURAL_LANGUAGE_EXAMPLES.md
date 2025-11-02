# Ejemplos de Consultas en Lenguaje Natural

Usa el modo de lenguaje natural para escribir consultas sin necesidad de conocer SQL. Claude convertirá automáticamente tu pregunta a SQL.

## 🚀 Cómo Usar

1. **Activa el modo Natural** usando el toggle en la esquina superior derecha
2. **Escribe tu pregunta** en español o inglés
3. **Haz clic en "Convertir a SQL"** y Claude generará el SQL
4. **Revisa el SQL generado** antes de ejecutarlo
5. **Ejecuta la consulta** para ver los resultados

## 📝 Ejemplos Básicos

### Consultas Simples

```
Muéstrame todos los clientes
```

```
¿Cuántos productos hay en la base de datos?
```

```
Lista los primeros 10 empleados
```

```
Muestra las categorías de productos
```

## 🔍 Consultas de Búsqueda

### Búsqueda por Criterios

```
Encuentra clientes en México
```

```
Productos que cuestan más de $50
```

```
Órdenes realizadas en el año 2024
```

```
Empleados que trabajan en ventas
```

### Búsquedas con Texto

```
Busca clientes cuyo nombre contenga "market"
```

```
Productos que incluyan la palabra "cheese"
```

```
Proveedores de Estados Unidos
```

## 📊 Consultas Analíticas

### Conteos y Agregaciones

```
¿Cuántos clientes hay por país?
```

```
Cuenta las órdenes por cliente
```

```
Total de productos por categoría
```

```
Promedio de precio por categoría de producto
```

### Ranking y Top N

```
Los 10 productos más caros
```

```
Los 5 mejores clientes por volumen de compras
```

```
Top 20 órdenes con mayor valor
```

```
Los 10 empleados con más ventas
```

### Análisis de Ventas

```
Total de ventas por país
```

```
Ventas mensuales del último año
```

```
Productos más vendidos
```

```
Cliente con más pedidos
```

## 🔗 Consultas con Relaciones

### JOINs Implícitos

```
Muestra las órdenes con el nombre del cliente
```

```
Productos con su categoría
```

```
Órdenes con detalles de productos
```

```
Empleados y sus jefes
```

### Análisis Combinados

```
Muestra los productos vendidos por cada categoría con su total de ventas
```

```
Lista los clientes con el total que han gastado
```

```
Órdenes con nombre del cliente y empleado que la procesó
```

```
Productos por proveedor con stock actual
```

## 💰 Consultas Financieras

```
¿Cuál es el valor total de las órdenes?
```

```
Suma total de productos en stock
```

```
Productos con descuento aplicado
```

```
Órdenes con costo de envío mayor a $100
```

## 📅 Consultas Temporales

```
Órdenes de los últimos 30 días
```

```
Empleados contratados en 2023
```

```
Productos agregados este año
```

```
Órdenes pendientes de envío
```

## ⚠️ Consultas de Inventario

```
Productos con stock bajo
```

```
Productos que necesitan reorden
```

```
Productos descontinuados
```

```
Stock disponible por categoría
```

## 🌍 Consultas Geográficas

```
Clientes por región
```

```
Distribución de proveedores por país
```

```
Órdenes enviadas a Europa
```

```
Clientes en ciudades que empiezan con "L"
```

## 🎯 Consultas Complejas

### Comparaciones y Filtros Múltiples

```
Productos caros con poco stock
```

```
Clientes de USA y México con más de 5 órdenes
```

```
Órdenes grandes enviadas en el último mes
```

```
Empleados jóvenes con más de 10 ventas
```

### Análisis de Tendencias

```
Compara las ventas del último mes con el mes anterior
```

```
Productos que no se han vendido en 6 meses
```

```
Clientes que no han ordenado este año
```

```
Categorías con crecimiento en ventas
```

## 💡 Tips para Mejores Resultados

### ✅ Buenas Prácticas

1. **Sé específico**: "Los 10 productos más caros" es mejor que "productos caros"
2. **Incluye límites**: "Muestra 20 clientes" es mejor que "muestra clientes"
3. **Usa nombres de tabla conocidos**: "clientes", "productos", "órdenes"
4. **Especifica el orden**: "ordenados por precio" o "del más reciente al más antiguo"

### Ejemplos Específicos vs Vagos

❌ **Vago:** "Dame datos"
✅ **Específico:** "Muéstrame los 10 clientes con más órdenes"

❌ **Vago:** "Productos"
✅ **Específico:** "Lista los productos ordenados por precio descendente, máximo 20"

❌ **Vago:** "Ventas"
✅ **Específico:** "Total de ventas por categoría de producto"

### Palabras Clave Útiles

- **Agregación**: total, suma, promedio, contar, máximo, mínimo
- **Filtros**: donde, con, que tengan, que sean, mayor que, menor que
- **Orden**: ordenar por, más alto, más bajo, primeros, últimos
- **Límites**: top, los 10, primeros 20, máximo 50
- **Tiempo**: últimos, este año, mes pasado, entre fechas

## 🔧 Solución de Problemas

### Si el SQL generado no es correcto:

1. **Intenta reformular la pregunta** con más detalles
2. **Especifica nombres de columnas** si los conoces
3. **Divide consultas complejas** en partes más simples
4. **Revisa el SQL generado** y corrígelo manualmente si es necesario

### Si obtienes un error:

```
❌ Error: "column does not exist"
```
**Solución:** Verifica los nombres de columnas en QUERY_EXAMPLES.md

```
❌ Error: "syntax error"
```
**Solución:** Reformula la pregunta o edita el SQL generado manualmente

## 🎓 Aprende SQL

El modo de lenguaje natural es excelente para:

- ✅ Explorar datos sin conocer SQL
- ✅ Aprender SQL viendo las conversiones
- ✅ Prototipar consultas rápidamente
- ✅ Consultas ad-hoc

Para consultas complejas o repetitivas, considera aprender SQL:
- Ver [QUERY_EXAMPLES.md](QUERY_EXAMPLES.md) para ejemplos de SQL
- Compara tus preguntas en lenguaje natural con el SQL generado
- Experimenta editando el SQL generado

## 🤖 Powered by Claude

Esta funcionalidad usa **Claude 3.7 Sonnet** de Anthropic, uno de los modelos de IA más avanzados para tareas de código y razonamiento.

### Características de Claude:

- 🧠 Comprende contexto complejo de bases de datos
- 📝 Genera SQL óptimo y eficiente
- 🔍 Entiende preguntas en múltiples idiomas
- ⚡ Responde en menos de 2 segundos

---

¿Tienes dudas? Consulta [SETUP.md](SETUP.md) para configurar tu API key de Anthropic.

