#Poner el proveedor de terraform, en este caso aws
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configurar la region de aws.
provider "aws" {
  region = var.region
}

#--------------------S3--------------------
resource "aws_s3_bucket" "s3"{    
  bucket = var.s3  #nombre que le pondremos al bucket

  tags = {
    name = "bucket"
    Enviroment = "Dev"
  }
}

#--------------------FIN S3--------------------

#--------------------VARIABLES--------------------
variable "s3"{
  description = "Nombre del bucket s3"
  type = string
  default = "cubo-s3-begona"
}

variable "region" {
  description = "AWS Region"
  type = string
  default = "us-east-1"
}

#--------------------FIN VARIABLES--------------------