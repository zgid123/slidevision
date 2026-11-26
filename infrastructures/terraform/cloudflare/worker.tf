resource "cloudflare_worker" "server" {
  account_id = var.cf_account_id
  name       = "slidevision-server"

  observability = {
    enabled = true
  }

  subdomain = {
    enabled = true
  }
}
