output "s3" {
  value = aws_s3_bucket.s3.id
}

output "ecr_repository_uri_url" {
  value = aws_ecr_repository.repositorio_ecr.repository_url
}

output "ecr_nombre_repositorio" {
  value = aws_ecr_repository.repositorio_ecr.name
}

output "security_group_id" {
  value = aws_security_group.lb_security.id
}

output "alb_url" {
  description = "La URL pública para la web"
  value = aws_lb.balanceador.dns_name
}