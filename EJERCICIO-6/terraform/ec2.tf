# EC2 Instance para Next.js

# Elastic IP para la instancia EC2
resource "aws_eip" "app_server" {
  domain   = "vpc"
  instance = aws_instance.app_server.id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-eip"
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# Instancia EC2
resource "aws_instance" "app_server" {
  ami                    = local.ami_id
  instance_type          = var.instance_type
  key_name               = var.ssh_key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  user_data = templatefile("${path.module}/scripts/user-data.sh", {
    db_endpoint = aws_db_instance.main.endpoint
    db_name     = var.db_name
    db_username = var.db_username
    db_password = var.db_password
  })

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-app-server"
    }
  )

  depends_on = [aws_db_instance.main]
}

