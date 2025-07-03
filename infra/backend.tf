terraform {
  backend "s3" {
    bucket         = "myonsite-terraform-state"
    key            = "myonsite-api/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
