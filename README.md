# MyOnSite API Deployment

This project includes Terraform configuration and a GitHub Actions workflow to deploy the Node.js application to Amazon ECS behind an Application Load Balancer.

## Terraform Setup

The Terraform files in `infra/` create the following resources:

- ECR repository to store the Docker image
- ECS cluster and service running on Fargate
- Application Load Balancer with listener and target group
- IAM roles and security groups
- Auto scaling policy based on CPU utilization

Before running Terraform, provide IDs for your existing VPC and subnets by setting the following variables. You can copy `infra/terraform.tfvars.example` to `infra/terraform.tfvars` and edit the values:

- `vpc_id`
- `public_subnets` (for the load balancer)
- `private_subnets` (for the ECS service)

Example initialization:

```bash
terraform -chdir=infra init
terraform -chdir=infra apply -auto-approve \
  -var="vpc_id=vpc-xxxx" \
  -var="public_subnets=[\"subnet-a\",\"subnet-b\"]" \
  -var="private_subnets=[\"subnet-c\",\"subnet-d\"]"
```

The output `alb_dns_name` provides the public endpoint of the service.

## GitHub Actions Deployment

The workflow in `.github/workflows/deploy.yml` automatically builds the Docker image, pushes it to ECR and updates the ECS service when changes are pushed to the `main` branch. Configure the following secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY` (name of the repository created by Terraform)
- `ECS_CLUSTER` and `ECS_SERVICE` (created by Terraform)
- `VPC_ID` – ID of your VPC
- `PUBLIC_SUBNETS` – JSON list of public subnet IDs
- `PRIVATE_SUBNETS` – JSON list of private subnet IDs

## Environment Variables

For local development copy `.env.example` to `.env` and adjust values as needed. The Dockerfile uses these variables when running locally with `docker-compose`. In production the values are defined directly in `infra/task-definition.json` and can be modified or replaced with AWS Secrets Manager entries if desired.

