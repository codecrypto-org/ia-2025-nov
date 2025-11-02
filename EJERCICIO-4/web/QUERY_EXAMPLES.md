# Ejemplos de Consultas SQL para Northwind

Aquí tienes una colección de consultas SQL útiles para explorar la base de datos Northwind.

## Consultas Básicas

### Ver todas las tablas disponibles
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Clientes
```sql
-- Listar todos los clientes
SELECT * FROM customers LIMIT 10;

-- Clientes por país
SELECT country, COUNT(*) as total_customers
FROM customers
GROUP BY country
ORDER BY total_customers DESC;

-- Buscar clientes por nombre
SELECT customer_id, company_name, contact_name, country
FROM customers
WHERE company_name ILIKE '%market%'
LIMIT 20;
```

### Productos
```sql
-- Productos más caros
SELECT product_name, unit_price, units_in_stock
FROM products
ORDER BY unit_price DESC
LIMIT 10;

-- Productos por categoría
SELECT c.category_name, COUNT(p.product_id) as total_products, 
       AVG(p.unit_price) as avg_price
FROM products p
JOIN categories c ON p.category_id = c.category_id
GROUP BY c.category_name
ORDER BY total_products DESC;

-- Productos con stock bajo
SELECT product_name, units_in_stock, units_on_order, reorder_level
FROM products
WHERE units_in_stock < reorder_level
ORDER BY units_in_stock;
```

## Consultas con JOINs

### Órdenes y Clientes
```sql
-- Órdenes recientes con información del cliente
SELECT o.order_id, o.order_date, c.company_name, c.country,
       o.shipped_date, o.freight
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC
LIMIT 20;

-- Clientes sin órdenes
SELECT c.customer_id, c.company_name, c.country
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

### Detalles de Órdenes
```sql
-- Detalle completo de una orden específica
SELECT o.order_id, o.order_date, c.company_name,
       p.product_name, od.unit_price, od.quantity,
       od.discount, (od.unit_price * od.quantity * (1 - od.discount)) as line_total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_details od ON o.order_id = od.order_id
JOIN products p ON od.product_id = p.product_id
WHERE o.order_id = 10248;

-- Top 10 productos más vendidos
SELECT p.product_name, SUM(od.quantity) as total_sold,
       SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue
FROM order_details od
JOIN products p ON od.product_id = p.product_id
GROUP BY p.product_name
ORDER BY total_sold DESC
LIMIT 10;
```

## Consultas Agregadas

### Ventas por Período
```sql
-- Ventas mensuales del último año
SELECT 
    DATE_TRUNC('month', order_date) as month,
    COUNT(order_id) as total_orders,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE order_date >= NOW() - INTERVAL '1 year'
GROUP BY month
ORDER BY month DESC;

-- Ventas por país
SELECT c.country, 
       COUNT(DISTINCT o.order_id) as total_orders,
       SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_details od ON o.order_id = od.order_id
GROUP BY c.country
ORDER BY total_revenue DESC
LIMIT 15;
```

### Análisis de Empleados
```sql
-- Empleados y sus órdenes
SELECT e.first_name || ' ' || e.last_name as employee_name,
       e.title,
       COUNT(o.order_id) as total_orders
FROM employees e
LEFT JOIN orders o ON e.employee_id = o.employee_id
GROUP BY e.employee_id, employee_name, e.title
ORDER BY total_orders DESC;

-- Mejor empleado por ventas
SELECT e.first_name || ' ' || e.last_name as employee_name,
       COUNT(DISTINCT o.order_id) as orders_handled,
       SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_sales
FROM employees e
JOIN orders o ON e.employee_id = o.employee_id
JOIN order_details od ON o.order_id = od.order_id
GROUP BY e.employee_id, employee_name
ORDER BY total_sales DESC;
```

### Proveedores
```sql
-- Proveedores y sus productos
SELECT s.company_name, s.country,
       COUNT(p.product_id) as total_products,
       AVG(p.unit_price) as avg_product_price
FROM suppliers s
LEFT JOIN products p ON s.supplier_id = p.supplier_id
GROUP BY s.supplier_id, s.company_name, s.country
ORDER BY total_products DESC;
```

## Consultas Avanzadas

### Análisis de Descuentos
```sql
-- Impacto de descuentos en ventas
SELECT 
    CASE 
        WHEN discount = 0 THEN 'Sin descuento'
        WHEN discount <= 0.1 THEN '1-10%'
        WHEN discount <= 0.2 THEN '11-20%'
        ELSE 'Más de 20%'
    END as discount_range,
    COUNT(*) as order_lines,
    SUM(unit_price * quantity) as revenue_before_discount,
    SUM(unit_price * quantity * (1 - discount)) as revenue_after_discount,
    SUM(unit_price * quantity * discount) as total_discount_amount
FROM order_details
GROUP BY discount_range
ORDER BY discount_range;
```

### Análisis de Categorías
```sql
-- Performance de categorías
SELECT c.category_name,
       COUNT(DISTINCT p.product_id) as products_count,
       COUNT(DISTINCT od.order_id) as orders_count,
       SUM(od.quantity) as units_sold,
       SUM(od.unit_price * od.quantity * (1 - od.discount)) as total_revenue
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_details od ON p.product_id = od.product_id
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;
```

### Clientes VIP
```sql
-- Top 10 mejores clientes
SELECT c.company_name, c.country,
       COUNT(DISTINCT o.order_id) as total_orders,
       SUM(od.unit_price * od.quantity * (1 - od.discount)) as lifetime_value,
       MAX(o.order_date) as last_order_date
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_details od ON o.order_id = od.order_id
GROUP BY c.customer_id, c.company_name, c.country
ORDER BY lifetime_value DESC
LIMIT 10;
```

### Análisis de Inventario
```sql
-- Productos que necesitan reorden
SELECT p.product_name, 
       p.units_in_stock,
       p.units_on_order,
       p.reorder_level,
       (p.reorder_level - p.units_in_stock) as units_needed,
       s.company_name as supplier,
       s.country as supplier_country
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE p.units_in_stock + p.units_on_order < p.reorder_level
ORDER BY units_needed DESC;
```

## Tips de Uso

1. **LIMIT**: Siempre usa `LIMIT` en consultas exploratorias para evitar resultados muy grandes.

2. **Fechas**: La base de datos Northwind puede tener datos antiguos. Ajusta los filtros de fecha según sea necesario.

3. **ILIKE**: Usa `ILIKE` en PostgreSQL para búsquedas case-insensitive en strings.

4. **Performance**: Las consultas con múltiples JOINs pueden ser lentas. Comienza simple y agrega complejidad gradualmente.

5. **NULL values**: Usa `IS NULL` o `IS NOT NULL` para verificar valores nulos, nunca `= NULL`.

## Comandos Útiles de PostgreSQL

```sql
-- Ver estructura de una tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Ver índices de una tabla
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- Ver el tamaño de las tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Errores Comunes

### Error: "relation does not exist"
- Las tablas pueden estar en minúsculas: usa `customers` en lugar de `Customers`
- Verifica los nombres de tabla con la consulta de información_schema arriba

### Error: "column ambiguously defined"
- Usa alias de tabla: `c.customer_id` en lugar de solo `customer_id` en JOINs

### Error: "division by zero"
- Verifica valores NULL antes de divisiones con `NULLIF()` o `CASE`

¡Experimenta con estas consultas y modifícalas según tus necesidades!

