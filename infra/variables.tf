variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ecr_repo_name" {
  description = "Name of ECR repository"
  type        = string
  default     = "myonsite-api"
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "myonsite-cluster"
}

variable "service_name" {
  description = "ECS service name"
  type        = string
  default     = "myonsite-service"
}

variable "desired_count" {
  description = "Desired task count"
  type        = number
  default     = 2
}

variable "vpc_id" {
  description = "VPC id"
  type        = string
}

variable "public_subnets" {
  description = "Public subnets for ALB"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnets for ECS"
  type        = list(string)
}
