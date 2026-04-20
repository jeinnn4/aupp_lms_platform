output "ec2_public_ip" {
  description = "Public IP address of the AUPP LMS EC2 instance"
  value       = aws_instance.aupp_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.aupp_server.public_dns
}

output "app_url" {
  description = "AUPP LMS application URL"
  value       = "http://${aws_instance.aupp_server.public_ip}:3000"
}

output "grafana_url" {
  description = "Grafana dashboard URL"
  value       = "http://${aws_instance.aupp_server.public_ip}:3001"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${aws_instance.aupp_server.public_ip}:9090"
}
