#include "net.h"

void net_init(Net* net)
{
  if (tls_init() != 0) { goto tls_err; }

  net->client = tls_client();
  if (net->client == NULL) { goto tls_err; }

  net->cfg = tls_config_new();
  if (net->cfg == NULL) { goto tls_err; }

  if (tls_config_set_ciphers(net->cfg, "secure") != 0) { goto tls_err; }

  // TODO: set CA file
  // if (tls_config_set_ca_file(*net->cfg, "peron.pem") != 0) { goto tls_err; }
  tls_config_insecure_noverifycert(net->cfg);
  tls_config_insecure_noverifyname(net->cfg);

  if (tls_configure(net->client, net->cfg) != 0) { goto tls_err; }

  net->initialized = true;

tls_err:
  fprintf(stderr, "%s\n", tls_error(net->client));
}

void net_destroy(Net* net)
{
  assert(net && net->initialized);
  assert(net->client && net->cfg);

  if (tls_close(net->client) != 0) { goto tls_err; }
	tls_free(net->client);
	tls_config_free(net->cfg);

tls_err:
  fprintf(stderr, "%s\n", tls_error(net->client));
}


// write
// read
// assert(net && net->initialized);
