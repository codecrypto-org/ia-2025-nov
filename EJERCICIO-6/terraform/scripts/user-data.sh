#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== Starting user-data script ==="

# Actualizar el sistema
yum update -y

# Instalar Node.js 18.x
echo "=== Installing Node.js ==="
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git

# Verificar instalación de Node.js
node --version
npm --version

# Instalar PM2 globalmente
echo "=== Installing PM2 ==="
npm install -g pm2

# Instalar y configurar Nginx
echo "=== Installing Nginx ==="
amazon-linux-extras install nginx1 -y || yum install -y nginx
systemctl enable nginx

# Crear directorio para la aplicación
echo "=== Setting up application directory ==="
mkdir -p /var/www/nextjs-app
chown -R ec2-user:ec2-user /var/www/nextjs-app

# Configurar Nginx
echo "=== Configuring Nginx ==="
cat > /etc/nginx/conf.d/nextjs.conf <<'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Eliminar configuración por defecto si existe
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Iniciar Nginx
systemctl start nginx
systemctl status nginx

# Configurar PM2 para arranque automático
echo "=== Configuring PM2 startup ==="
su - ec2-user -c "pm2 startup systemd -u ec2-user --hp /home/ec2-user" | grep "sudo" | bash

# Crear script de información del sistema
cat > /home/ec2-user/system-info.sh <<'EOF'
#!/bin/bash
echo "=== System Information ==="
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo "=========================="
EOF

chmod +x /home/ec2-user/system-info.sh
chown ec2-user:ec2-user /home/ec2-user/system-info.sh

# Crear archivo de variables de entorno temporal (será reemplazado por el deploy)
cat > /var/www/nextjs-app/.env.production <<EOF
# Este archivo será reemplazado durante el deployment
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_endpoint}/${db_name}
NODE_ENV=production
EOF

chown ec2-user:ec2-user /var/www/nextjs-app/.env.production
chmod 600 /var/www/nextjs-app/.env.production

echo "=== User-data script completed successfully ==="
echo "=== Application directory: /var/www/nextjs-app ==="
echo "=== Run /home/ec2-user/system-info.sh to see installed versions ==="

