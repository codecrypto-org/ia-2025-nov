#!/bin/bash
set -e

# Script de deployment para ejecutar en el servidor EC2

APP_DIR="/var/www/nextjs-app"
LOG_FILE="/var/log/nextjs-deploy.log"

# Función para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting deployment ==="

# Ir al directorio de la aplicación
cd "$APP_DIR"

# Instalar dependencias de producción
log "Installing production dependencies..."
npm ci --production --prefer-offline --no-audit

# Verificar que los archivos .next existen
if [ ! -d ".next" ]; then
    log "ERROR: .next directory not found. Build was not uploaded correctly."
    exit 1
fi

# Verificar configuración de PM2
if [ ! -f "ecosystem.config.js" ]; then
    log "ERROR: ecosystem.config.js not found"
    exit 1
fi

# Verificar que las variables de entorno existen
if [ ! -f ".env.production" ]; then
    log "WARNING: .env.production not found"
fi

# Verificar estado de PM2
log "Checking PM2 status..."
if pm2 list | grep -q "nextjs-app"; then
    log "Restarting existing PM2 process..."
    pm2 restart ecosystem.config.js --update-env
else
    log "Starting new PM2 process..."
    pm2 start ecosystem.config.js
fi

# Guardar configuración de PM2
log "Saving PM2 configuration..."
pm2 save

# Mostrar estado
log "Current PM2 status:"
pm2 list

# Verificar que la aplicación está corriendo
log "Waiting for application to start..."
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "=== Deployment completed successfully ==="
    log "Application is running on http://localhost:3000"
else
    log "WARNING: Application may not be responding on port 3000"
    log "Check PM2 logs with: pm2 logs nextjs-app"
fi

# Limpiar logs antiguos de PM2 (mantener últimos 7 días)
pm2 flush

log "=== Deployment finished ==="

