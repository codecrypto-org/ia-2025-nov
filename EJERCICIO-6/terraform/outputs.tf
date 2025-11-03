# Outputs de la infraestructura

output "vpc_id" {
  description = "ID de la VPC"
  value       = aws_vpc.main.id
}

output "ec2_instance_id" {
  description = "ID de la instancia EC2"
  value       = aws_instance.app_server.id
}

output "ec2_public_ip" {
  description = "IP pública de la instancia EC2"
  value       = aws_eip.app_server.public_ip
}

output "ec2_public_dns" {
  description = "DNS público de la instancia EC2"
  value       = aws_eip.app_server.public_dns
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "Nombre de la base de datos"
  value       = aws_db_instance.main.db_name
}

output "rds_username" {
  description = "Usuario de la base de datos"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "database_url" {
  description = "URL de conexión a la base de datos (para GitHub Secrets)"
  value       = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

output "security_group_ec2_id" {
  description = "ID del security group de EC2"
  value       = aws_security_group.ec2.id
}

output "security_group_rds_id" {
  description = "ID del security group de RDS"
  value       = aws_security_group.rds.id
}

output "instructions" {
  description = "Instrucciones para configurar Cloudflare"
  value       = <<-EOT
    ========================================
    CONFIGURACIÓN POST-DESPLIEGUE
    ========================================
    
    1. CLOUDFLARE DNS:
       - Ve a tu dashboard de Cloudflare
       - Añade un registro A:
         * Nombre: @ (o el subdominio que desees)
         * IPv4: ${aws_eip.app_server.public_ip}
         * Proxy status: Proxied (naranja)
    
    2. CLOUDFLARE SSL/TLS:
       - Ve a SSL/TLS > Overview
       - Configura el modo a "Full" o "Full (strict)"
    
    3. GITHUB SECRETS:
       - AWS_EC2_HOST: ${aws_eip.app_server.public_ip}
       - AWS_EC2_USER: ec2-user
       - AWS_EC2_SSH_KEY: (tu clave privada SSH)
       - DATABASE_URL: (ver output 'database_url')
    
    4. CONECTAR A EC2:
       ssh -i ~/.ssh/tu-key.pem ec2-user@${aws_eip.app_server.public_ip}
    
    ========================================
  EOT
}

