# Creates the self-signed ECDSA P-384 certificate that signs the macOS app.
# Uses macOS's own OpenSSL: its .p12 files import into the keychain as they are.
OPENSSL := /usr/bin/openssl
NAME := Slidevision (tachyon.cyou)

.PHONY: macos-signing

macos-signing:
	@if [ -e slidevision-signing.p12 ]; then \
		echo "slidevision-signing.p12 already exists. Move it away first to make a new certificate."; \
		exit 1; \
	fi
	@$(OPENSSL) ecparam -name secp384r1 -out ec.param
	@$(OPENSSL) req -x509 -newkey ec:ec.param -sha256 -days 3650 -nodes \
		-keyout key.pem -out cert.pem -config macos-signing.cnf
	@rm ec.param
	@$(OPENSSL) rand -hex 24 | tr -d '\n' > p12.pass
	@$(OPENSSL) pkcs12 -export -inkey key.pem -in cert.pem \
		-name "$(NAME)" -out slidevision-signing.p12 -passout file:p12.pass
	@chmod 600 p12.pass slidevision-signing.p12
	@# The .p12 holds the key and certificate; drop the unprotected copies.
	@rm key.pem cert.pem
	@$(OPENSSL) pkcs12 -in slidevision-signing.p12 -passin file:p12.pass -nokeys \
		| $(OPENSSL) x509 -noout -subject -enddate
