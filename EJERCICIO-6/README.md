# Next.js Deployment en AWS con Terraform y CI/CD

Este proyecto configura una infraestructura completa en AWS para desplegar una aplicación Next.js utilizando Terraform para la infraestructura como código y GitHub Actions para CI/CD.

## 🏗️ Arquitectura

- **EC2**: Servidor con Node.js, PM2 y Nginx
- **RDS PostgreSQL**: Base de datos en subnet privada
- **VPC**: Red privada con subnets públicas y privadas
- **Cloudflare**: DNS y SSL/TLS
- **GitHub Actions**: CI/CD automático

## 📋 Requisitos Previos

1. **AWS Account** con credenciales configuradas
2. **Terraform** instalado (v1.0+)
3. **AWS CLI** instalado y configurado
4. **Cuenta de Cloudflare** con un dominio configurado
5. **Repositorio GitHub** para tu aplicación Next.js

## 🚀 Configuración Inicial

### 1. Configurar AWS CLI

```bash
aws configure
```

Ingresa tu Access Key ID, Secret Access Key, región y formato de salida.

### 2. Crear SSH Key Pair en AWS

```bash
aws ec2 create-key-pair \
  --key-name nextjs-app-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/nextjs-app-key.pem

chmod 400 ~/.ssh/nextjs-app-key.pem
```

### 3. Configurar Variables de Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con tus valores:

```hcl
aws_region    = "us-east-1"
project_name  = "nextjs-app"
environment   = "production"
instance_type = "t3.small"
ssh_key_name  = "nextjs-app-key"

db_instance_class = "db.t3.micro"
db_name           = "nextjsdb"
db_username       = "dbadmin"
db_password       = "TuPasswordSeguro123!"

domain_name = "tudominio.com"
```

### 4. Desplegar Infraestructura con Terraform

```bash
cd terraform

# Inicializar Terraform
terraform init

# Ver el plan de ejecución
terraform plan

# Aplicar cambios (crear infraestructura)
terraform apply
```

Terraform creará:
- VPC con subnets públicas y privadas
- Internet Gateway y NAT Gateway
- Security Groups
- Instancia EC2 con Elastic IP
- Base de datos RDS PostgreSQL
- Configuración automática de Node.js, PM2 y Nginx

**Guarda los outputs**, especialmente:
- `ec2_public_ip`: IP pública del servidor
- `database_url`: URL de conexión a la base de datos

### 5. Configurar Cloudflare

1. Inicia sesión en [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona tu dominio
3. Ve a **DNS** > **Records**
4. Añade un registro A:
   - **Type**: A
   - **Name**: @ (o el subdominio que desees)
   - **IPv4 address**: La IP pública de tu EC2 (output de Terraform)
   - **Proxy status**: ✅ Proxied (naranja)
   - **TTL**: Auto

5. Configura SSL/TLS:
   - Ve a **SSL/TLS** > **Overview**
   - Selecciona modo: **Full** o **Full (strict)**

### 6. Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings** > **Secrets and variables** > **Actions** y añade:

| Secret Name | Valor | Descripción |
|------------|-------|-------------|
| `AWS_EC2_HOST` | IP pública de EC2 | Del output de Terraform |
| `AWS_EC2_USER` | `ec2-user` | Usuario por defecto de Amazon Linux |
| `AWS_EC2_SSH_KEY` | Contenido del archivo .pem | La clave privada SSH completa |
| `DATABASE_URL` | postgresql://user:pass@host/db | Del output de Terraform |
| `NEXTAUTH_SECRET` | String aleatorio | Para NextAuth.js (si lo usas) |
| `DOMAIN_NAME` | tudominio.com | Tu dominio (opcional) |

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 🔄 Deployment Automático

### Configurar el Workflow

El workflow de GitHub Actions (`.github/workflows/deploy.yml`) se ejecutará automáticamente en cada push a la rama `main`.

**Proceso de deployment:**

1. **Build Job**:
   - Checkout del código
   - Instalación de dependencias
   - Build de Next.js
   - Creación de artifact

2. **Deploy Job**:
   - Descarga del artifact
   - Transferencia de archivos a EC2 vía rsync
   - Instalación de dependencias de producción
   - Reinicio de la aplicación con PM2

### Deploy Manual

También puedes ejecutar el workflow manualmente:

1. Ve a tu repositorio en GitHub
2. **Actions** > **Deploy Next.js to AWS EC2**
3. **Run workflow**

## 📝 Comandos Útiles

### Conectar al servidor EC2

```bash
ssh -i ~/.ssh/nextjs-app-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### Ver logs de la aplicación

```bash
# Logs de PM2
pm2 logs nextjs-app

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs de deployment
tail -f /var/log/nextjs-deploy.log
```

### Gestionar PM2

```bash
# Estado de la aplicación
pm2 list

# Reiniciar aplicación
pm2 restart nextjs-app

# Detener aplicación
pm2 stop nextjs-app

# Ver información detallada
pm2 show nextjs-app

# Monitoreo en tiempo real
pm2 monit
```

### Gestionar Nginx

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx
```

## 🗄️ Base de Datos

### Conectar a RDS

Desde el servidor EC2:

```bash
psql "$DATABASE_URL"
```

O instala un cliente PostgreSQL localmente y conéctate usando un túnel SSH:

```bash
ssh -i ~/.ssh/nextjs-app-key.pem -L 5432:<RDS_ENDPOINT>:5432 ec2-user@<EC2_PUBLIC_IP>

# En otra terminal
psql postgresql://dbadmin:password@localhost:5432/nextjsdb
```

### Migraciones de Base de Datos

Si usas Prisma, ejecuta migraciones durante el deployment añadiendo en `.github/workflows/deploy.yml`:

```yaml
- name: Run database migrations
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.AWS_EC2_HOST }}
    username: ${{ secrets.AWS_EC2_USER }}
    key: ${{ secrets.AWS_EC2_SSH_KEY }}
    script: |
      cd /var/www/nextjs-app
      npx prisma migrate deploy
```

## 🔒 Seguridad

### Mejores Prácticas Implementadas

- ✅ RDS en subnet privada (no accesible desde internet)
- ✅ Security Groups restrictivos
- ✅ Encriptación de volúmenes EBS
- ✅ Encriptación de RDS
- ✅ SSL/TLS gestionado por Cloudflare
- ✅ Variables de entorno seguras con GitHub Secrets

### Recomendaciones Adicionales

1. **Rotar credenciales** de RDS periódicamente
2. **Configurar AWS WAF** si esperas alto tráfico
3. **Habilitar CloudWatch Logs** para monitoreo
4. **Configurar alertas** de CloudWatch
5. **Usar AWS Systems Manager Session Manager** como alternativa a SSH
6. **Configurar Multi-AZ** para RDS en producción (`multi_az = true`)
7. **Habilitar protección contra eliminación** (`deletion_protection = true`)

## 💰 Costos Estimados

Costos mensuales aproximados (región us-east-1):

| Recurso | Configuración | Costo Mensual |
|---------|---------------|---------------|
| EC2 t3.small | On-Demand | ~$15 |
| RDS db.t3.micro | PostgreSQL | ~$15 |
| EBS Storage | 30 GB | ~$3 |
| RDS Storage | 20 GB | ~$2.30 |
| Data Transfer | 100 GB | ~$9 |
| NAT Gateway | 1 | ~$32 |
| **Total Estimado** | | **~$76/mes** |

Para reducir costos:
- Usar instancias Spot para EC2
- Eliminar NAT Gateway si no es necesario
- Usar RDS db.t4g.micro (ARM - más barato)

## 🛠️ Troubleshooting

### La aplicación no arranca

```bash
# Ver logs de PM2
pm2 logs nextjs-app --lines 100

# Verificar que los archivos existen
ls -la /var/www/nextjs-app/

# Verificar variables de entorno
cat /var/www/nextjs-app/.env.production
```

### Error de conexión a la base de datos

```bash
# Verificar endpoint de RDS
echo $DATABASE_URL

# Probar conexión desde EC2
nc -zv <RDS_ENDPOINT> 5432

# Verificar security groups
aws ec2 describe-security-groups --group-ids <SG_ID>
```

### Nginx no funciona

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### GitHub Actions falla en el deploy

1. Verifica que los **Secrets** estén correctamente configurados
2. Verifica que la clave SSH tenga formato correcto (incluye `-----BEGIN RSA PRIVATE KEY-----`)
3. Verifica conectividad SSH manualmente

## 🧹 Limpieza

Para eliminar toda la infraestructura:

```bash
cd terraform
terraform destroy
```

⚠️ **Advertencia**: Esto eliminará permanentemente todos los recursos, incluyendo la base de datos.

## 📚 Referencias

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Cloudflare SSL/TLS](https://developers.cloudflare.com/ssl/)

## 📧 Soporte

Si encuentras problemas, revisa:
1. Logs de la aplicación en EC2
2. GitHub Actions logs
3. CloudWatch logs en AWS

---

**Autor**: José Viejo  
**Fecha**: Noviembre 2025

