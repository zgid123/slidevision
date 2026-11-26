resource "cloudflare_r2_bucket" "slidevision" {
  account_id = var.cf_account_id
  name       = "slidevision"
  location   = "apac"
}
