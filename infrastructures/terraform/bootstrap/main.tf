terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.29"
    }
  }
}

provider "cloudflare" {}

variable "cf_account_id" {
  type = string
}

resource "cloudflare_r2_bucket" "terraform_state" {
  account_id = var.cf_account_id
  name       = "slidevision-terraform"
  location   = "apac"
}
