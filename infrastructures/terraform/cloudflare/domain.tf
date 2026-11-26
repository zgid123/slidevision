resource "cloudflare_workers_custom_domain" "server" {
  account_id = var.cf_account_id
  zone_name  = "tachyon.cyou"
  hostname   = "slidevision-server.tachyon.cyou"
  service    = cloudflare_worker.server.name
}
