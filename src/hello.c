#include <stdio.h>
#include <tls.h>

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
  if (tls_config_set_ca_file(*cfg, "peron.pem") != 0) { goto tls_err; }
  // tls_config_insecure_noverifycert(*cfg);
  // tls_config_insecure_noverifyname(*cfg);
  if (tls_configure(*tls, *cfg) != 0) { goto tls_err; }

  // Test TLS
  ssize_t written, read;
  char buf[4096];

  if (tls_connect(*tls, "google.com", "443") != 0) { goto tls_err; }
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

int main (void)
{
  struct tls* tls;
  struct tls_config* cfg;

  init_tls(&tls, &cfg);

  printf("Hello TLS!\n");
  return 0;
}
