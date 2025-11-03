# Variables de configuración para la infraestructura AWS

variable "aws_region" {
  description = "AWS region donde desplegar la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "nextjs-app"
}

variable "environment" {
  description = "Ambiente (dev, staging, production)"
  type        = string
  default     = "production"
}

# EC2 Configuration
variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.small"
}

variable "ssh_key_name" {
  description = "Nombre del key pair de AWS para acceso SSH"
  type        = string
}

variable "ami_id" {
  description = "AMI ID para EC2 (Amazon Linux 2 por defecto)"
  type        = string
  default     = "" # Se obtendrá automáticamente si está vacío
}

# RDS Configuration
variable "db_instance_class" {
  description = "Clase de instancia para RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Nombre de la base de datos"
  type        = string
  default     = "nextjsdb"
}

variable "db_username" {
  description = "Usuario master de la base de datos"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Contraseña del usuario master de la base de datos"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Almacenamiento asignado para RDS en GB"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "Versión de PostgreSQL"
  type        = string
  default     = "14.7"
}

# Network Configuration
variable "vpc_cidr" {
  description = "CIDR block para la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidad a usar"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Domain Configuration
variable "domain_name" {
  description = "Nombre de dominio para la aplicación"
  type        = string
}

# Tags
variable "tags" {
  description = "Tags comunes para todos los recursos"
  type        = map(string)
  default = {
    Terraform   = "true"
    Project     = "nextjs-app"
    Environment = "production"
  }
}

