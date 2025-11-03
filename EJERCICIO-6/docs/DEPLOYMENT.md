# Guía de Deployment

Esta guía te ayudará a desplegar tu aplicación Next.js en AWS paso a paso.

## Pre-requisitos Checklist

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de AWS con permisos de administrador
- [ ] AWS CLI instalado y configurado
- [ ] Terraform instalado (v1.0+)
- [ ] Cuenta de Cloudflare con un dominio
- [ ] Repositorio GitHub con tu código Next.js
- [ ] Node.js 18+ instalado localmente

## Paso 1: Configurar AWS

### 1.1 Configurar Credenciales AWS

```bash
aws configure
```

Ingresa:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 1.2 Verificar Configuración

```bash
aws sts get-caller-identity
```

Deberías ver tu Account ID y User ARN.

## Paso 2: Crear Key Pair SSH

```bash
# Crear el key pair
aws ec2 create-key-pair \
  --key-name nextjs-app-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/nextjs-app-key.pem

# Establecer permisos correctos
chmod 400 ~/.ssh/nextjs-app-key.pem

# Verificar
ls -la ~/.ssh/nextjs-app-key.pem
```

## Paso 3: Configurar Terraform

### 3.1 Crear Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

### 3.2 Editar terraform.tfvars

```hcl
aws_region    = "us-east-1"
project_name  = "nextjs-app"
environment   = "production"
instance_type = "t3.small"
ssh_key_name  = "nextjs-app-key"

db_instance_class = "db.t3.micro"
db_name           = "nextjsdb"
db_username       = "dbadmin"
db_password       = "CambiaEstePorUnPasswordSeguro123!"

domain_name = "tudominio.com"
```

⚠️ **Importante**: Usa un password seguro para la base de datos.

## Paso 4: Desplegar Infraestructura

### 4.1 Inicializar Terraform

```bash
terraform init
```

Esto descargará los providers necesarios.

### 4.2 Validar Configuración

```bash
terraform validate
```

### 4.3 Ver Plan de Ejecución

```bash
terraform plan
```

Revisa los recursos que se crearán.

### 4.4 Aplicar Cambios

```bash
terraform apply
```

Escribe `yes` cuando se te solicite.

Este proceso tomará aproximadamente 10-15 minutos.

### 4.5 Guardar Outputs

```bash
terraform output > ../terraform-outputs.txt
terraform output -raw database_url > ../database-url-secret.txt
```

⚠️ **Importante**: `database-url-secret.txt` contiene información sensible. NO lo subas a Git.

## Paso 5: Configurar Cloudflare

### 5.1 Añadir Registro DNS

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona tu dominio
3. Ve a **DNS** > **Records**
4. Click en **Add record**
5. Configura:
   - **Type**: A
   - **Name**: @ (para dominio raíz) o `app` (para subdominio)
   - **IPv4 address**: `<EC2_PUBLIC_IP>` (del output de Terraform)
   - **Proxy status**: ✅ Proxied (naranja)
   - **TTL**: Auto

### 5.2 Configurar SSL/TLS

1. Ve a **SSL/TLS** > **Overview**
2. Selecciona: **Full (strict)**
3. Ve a **Edge Certificates**
4. Verifica que esté habilitado:
   - Always Use HTTPS: ✅
   - Minimum TLS Version: 1.2
   - Opportunistic Encryption: ✅
   - TLS 1.3: ✅
   - Automatic HTTPS Rewrites: ✅

### 5.3 (Opcional) Configurar Page Rules

Para mejorar el rendimiento:

1. Ve a **Rules** > **Page Rules**
2. Crea una regla:
   - URL: `tudominio.com/_next/static/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 year

## Paso 6: Verificar la Instancia EC2

### 6.1 Conectar vía SSH

```bash
ssh -i ~/.ssh/nextjs-app-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### 6.2 Verificar Instalación

```bash
# Ver versiones instaladas
/home/ec2-user/system-info.sh

# Verificar servicios
sudo systemctl status nginx
pm2 list

# Ver logs del user-data script
sudo tail -f /var/log/user-data.log
```

### 6.3 Probar Nginx

```bash
curl http://localhost:80/health
```

Deberías ver: `OK`

## Paso 7: Configurar GitHub Secrets

### 7.1 Obtener Valores

De los outputs de Terraform:
- `ec2_public_ip` → `AWS_EC2_HOST`
- `database_url` → `DATABASE_URL`

### 7.2 Generar Secrets Adicionales

```bash
# Para NEXTAUTH_SECRET (si usas NextAuth.js)
openssl rand -base64 32
```

### 7.3 Añadir en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

Añade los siguientes secrets:

| Name | Value |
|------|-------|
| AWS_EC2_HOST | IP pública de EC2 |
| AWS_EC2_USER | ec2-user |
| AWS_EC2_SSH_KEY | Contenido completo de nextjs-app-key.pem |
| DATABASE_URL | URL de conexión PostgreSQL |
| NEXTAUTH_SECRET | String aleatorio generado |
| DOMAIN_NAME | tudominio.com |

Para `AWS_EC2_SSH_KEY`:
```bash
cat ~/.ssh/nextjs-app-key.pem
```

Copia TODO el contenido, incluyendo:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

## Paso 8: Primer Deployment

### 8.1 Preparar tu Aplicación Next.js

Asegúrate de que tu repositorio tenga:
- `package.json` con script `build`
- Configuración para usar `DATABASE_URL`
- Archivos `.github/workflows/deploy.yml` (ya creado)
- `scripts/ecosystem.config.js` (ya creado)
- `scripts/deploy.sh` (ya creado)

### 8.2 Commit y Push

```bash
git add .
git commit -m "Configure AWS deployment"
git push origin main
```

### 8.3 Monitorear Deployment

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Verás el workflow "Deploy Next.js to AWS EC2" ejecutándose

El proceso incluye:
1. Build de la aplicación
2. Creación de artifact
3. Despliegue a EC2
4. Reinicio de PM2

### 8.4 Verificar Deployment

Una vez completado:

```bash
# Verificar en EC2
ssh -i ~/.ssh/nextjs-app-key.pem ec2-user@<EC2_PUBLIC_IP>

# Ver estado de PM2
pm2 list

# Ver logs recientes
pm2 logs nextjs-app --lines 50
```

Visita tu dominio en el navegador: `https://tudominio.com`

## Paso 9: Post-Deployment

### 9.1 Configurar Migraciones de Base de Datos

Si usas Prisma, añade esto en `.github/workflows/deploy.yml` antes de reiniciar PM2:

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
      npx prisma generate
```

### 9.2 Configurar Monitoring

Considera configurar:
- CloudWatch Alarms para CPU/Memory/Disk
- CloudWatch Logs Agent
- Uptimerobot o similar para monitoreo externo

### 9.3 Configurar Backups

Los backups de RDS ya están configurados (7 días de retención).

Para backups de archivos en EC2, considera:
- AWS Backup
- Snapshots de EBS programados
- S3 sync para archivos estáticos

## Troubleshooting

### Problema: GitHub Actions falla en "Setup SSH key"

**Solución**: Verifica que `AWS_EC2_SSH_KEY` contenga la clave completa con headers:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

### Problema: La aplicación no responde después del deploy

```bash
# Conectar a EC2
ssh -i ~/.ssh/nextjs-app-key.pem ec2-user@<EC2_PUBLIC_IP>

# Ver logs de PM2
pm2 logs nextjs-app --lines 100

# Verificar archivos
ls -la /var/www/nextjs-app/

# Verificar variables de entorno
cat /var/www/nextjs-app/.env.production

# Reiniciar manualmente
cd /var/www/nextjs-app
pm2 restart ecosystem.config.js
```

### Problema: Error de conexión a base de datos

```bash
# Desde EC2, probar conexión
nc -zv <RDS_ENDPOINT> 5432

# Probar con psql
psql "$DATABASE_URL"
```

Si no conecta, verifica los security groups en AWS Console.

### Problema: SSL/TLS errors

1. Verifica que Cloudflare SSL/TLS mode esté en "Full" o "Full (strict)"
2. Espera unos minutos para que los certificados se propaguen
3. Limpia la caché de Cloudflare

## Rollback

Si necesitas revertir a una versión anterior:

```bash
# Opción 1: Revertir commit en Git y hacer push
git revert <commit-hash>
git push origin main

# Opción 2: Deployment manual de una versión anterior
# (Conectar a EC2 y usar un backup)
```

## Limpieza/Destrucción

Para eliminar toda la infraestructura:

```bash
cd terraform
terraform destroy
```

⚠️ **Advertencia**: Esto eliminará permanentemente:
- Instancia EC2 y su Elastic IP
- Base de datos RDS (y todos los datos)
- VPC y networking
- Security groups

Los backups de RDS se mantendrán según el período de retención configurado.

---

¿Necesitas ayuda? Revisa el [README.md](../README.md) principal o consulta los logs detallados.

