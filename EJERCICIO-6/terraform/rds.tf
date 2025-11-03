# RDS PostgreSQL Database

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  # Multi-AZ disabled para ahorrar costos (cambiar a true para producción)
  multi_az = false

  # Protección contra eliminación accidental
  deletion_protection = false # Cambiar a true para producción
  skip_final_snapshot = true  # Cambiar a false para producción

  # Performance Insights (opcional)
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Opciones de actualización
  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-postgresql"
    }
  )
}

