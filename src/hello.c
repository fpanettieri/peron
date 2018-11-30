#include <stdio.h>
#include <tls.h>

#include "http.c"

int init_tls (struct tls** tls, struct tls_config** cfg)
{
  if (tls_init() != 0) {
    fprintf(stderr, "tls_init failed");
    return -1;
  }

  if ((*tls = tls_client()) == NULL) { goto tls_err; }

  // TLS config
  if ((*cfg = tls_config_new()) == NULL) { goto tls_err; }
  if (tls_config_set_ciphers(*cfg, "secure") != 0) { goto tls_err; }
  // if (tls_config_set_ca_file(*cfg, "peron.pem") != 0) { goto tls_err; }
  tls_config_insecure_noverifycert(*cfg);
  tls_config_insecure_noverifyname(*cfg);
  if (tls_configure(*tls, *cfg) != 0) { goto tls_err; }

  // Test TLS
  ssize_t written, read;
  char buf[4096];

  if (tls_connect(*tls, "testnet.bitmex.com", "443") != 0) { goto tls_err; }
  if ((written = tls_write(*tls, "GET /\r\n", 7)) < 0) { goto tls_err; }
  if ((read = tls_read(*tls, buf, sizeof(buf))) < 0) { goto tls_err; }

  buf[read - 1] = '\0';
  puts(buf);

  // TLS cleanup
  if (tls_close(*tls) != 0) { goto tls_err; }
  return 0;

tls_err:
  fprintf(stderr, "%s\n", tls_error(*tls));
  return -1;
}

void handshake ()
{
  "GET /chat HTTP/1.1 \
  Host: server.example.com \
  Upgrade: websocket \
  Connection: Upgrade \
  Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw== \
  Sec-WebSocket-Protocol: chat, superchat \
  Sec-WebSocket-Version: 13 \
  Origin: http://example.com"
}

GET wss://echo.websocket.org/?encoding=text HTTP/1.1
Host: echo.websocket.org
Connection: Upgrade
Pragma: no-cache
Cache-Control: no-cache
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36
Upgrade: websocket
Origin: https://www.websocket.org
Sec-WebSocket-Version: 13
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9,es-419;q=0.8,es;q=0.7,fr;q=0.6
Sec-WebSocket-Key: KT/1qzXYOKEUspjAuPRjKQ==
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits

int main (void)
{
  struct tls* tls;
  struct tls_config* cfg;

  init_tls(&tls, &cfg);

  printf("Hello TLS!\n");
  return 0;
}
