ENV_FILE := $(CURDIR)/../../.env
LOAD_ENV := if [ -f "$(ENV_FILE)" ]; then set -a; . "$(ENV_FILE)"; set +a; fi

.PHONY: bootstrap plan apply

bootstrap:
	@$(LOAD_ENV); terraform -chdir=bootstrap init && terraform -chdir=bootstrap apply

plan:
	@$(LOAD_ENV); terraform -chdir=cloudflare init -input=false && terraform -chdir=cloudflare plan

apply:
	@$(LOAD_ENV); terraform -chdir=cloudflare init -input=false && terraform -chdir=cloudflare apply
