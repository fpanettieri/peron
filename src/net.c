#include "net.h"

int net_init (Net* net)
{
  if (tls_init() != 0) {
    fprintf(stderr, "tls_init failed");
    return -1;
  }

  net->client = tls_client();
  if (net->client == NULL) { goto tls_err; }

  struct tls_config* cfg = tls_config_new();
  if (cfg == NULL) { goto tls_err; }

  if (tls_config_set_ciphers(cfg, "secure") != 0) { goto tls_err; }
  // if (tls_config_set_ca_file(*cfg, "peron.pem") != 0) { goto tls_err; }
  tls_config_insecure_noverifycert(cfg);
  tls_config_insecure_noverifyname(cfg);
  if (tls_configure(net->client, cfg) != 0) { goto tls_err; }


tls_err:
  fprintf(stderr, "%s\n", tls_error(net->client));
  return -1;
}
