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
- `private_subnets` (for the ECS service, optional)

Example initialization:

```bash
terraform -chdir=infra init
terraform -chdir=infra apply -auto-approve \
  -var="vpc_id=vpc-xxxx" \
  -var="public_subnets=[\"subnet-a\",\"subnet-b\"]"
# Optionally specify private subnets
# -var="private_subnets=[\"subnet-c\",\"subnet-d\"]"
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
- `PRIVATE_SUBNETS` – JSON list of private subnet IDs (optional)

If private subnets are provided, the ECS tasks are launched in them without a public IP address. Otherwise the tasks run in the public subnets.

## Environment Variables

For local development copy `.env.example` to `.env` and adjust values as needed. The Dockerfile uses these variables when running locally with `docker-compose`. In production the values are defined directly in `infra/task-definition.json` and can be modified or replaced with AWS Secrets Manager entries if desired.

## Troubleshooting

If `terraform apply` fails with errors like `Missing expression` or `No value for required variable`, ensure you supply values for `vpc_id` and `public_subnets`. The `private_subnets` variable is optional. Example with placeholder IDs:

```bash
terraform -chdir=infra apply -auto-approve \
  -var="vpc_id=vpc-12345678" \
  -var="public_subnets=[\"subnet-aaaabbbb\"]"
  # -var="private_subnets=[\"subnet-ccccdddd\"]"
```


## Importing existing AWS resources

If resources like the ECR repository or IAM roles were created outside of Terraform, you can bring them under management without deleting them. Use `terraform import` before running `terraform apply`:

```bash
terraform -chdir=infra import aws_ecr_repository.app myonsite-api
terraform -chdir=infra import aws_iam_role.task_execution myonsite-service-exec
# replace sg-xxxxxxxx with your existing ALB security group ID
terraform -chdir=infra import aws_security_group.alb sg-xxxxxxxx
# replace REGION, ACCOUNT_ID and ID with values from the existing target group ARN
terraform -chdir=infra import aws_lb_target_group.app arn:aws:elasticloadbalancing:REGION:ACCOUNT_ID:targetgroup/myonsite-service-tg/ID

```

After the import completes, run `terraform plan` to review any changes and then `terraform apply`.
