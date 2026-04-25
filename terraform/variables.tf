variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"   # Singapore — closest to Phnom Penh
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID for ap-southeast-1"
  type        = string
  default     = "ami-0df7a207adb9748c7"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"   # Free tier eligible
}

variable "key_name" {
  description = "Name of the AWS Key Pair to use for SSH access"
  type        = string
}
