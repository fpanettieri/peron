#include "net.h"

void net_init(Net* net)
{
  assert(net);

  U8 error = 0;
  error = tls_init();
  assert(error == 0);

  net->client = tls_client();
  assert(net->client);

  net->cfg = tls_config_new();
  assert(net->cfg);

  error = tls_config_set_ciphers(net->cfg, "secure");
  assert(error == 0);

  // TODO: set CA file
  // if (tls_config_set_ca_file(*net->cfg, "peron.pem") != 0) { goto tls_err; }
  tls_config_insecure_noverifycert(net->cfg);
  tls_config_insecure_noverifyname(net->cfg);

  error = tls_configure(net->client, net->cfg);
  assert(error == 0);

  net->initialized = true;
}

void net_connect(Net* net, const char* host, const char* port)
{
  assert(net && net->initialized);
  U8 error = tls_connect(net->client, host, port);
  assert(error == 0);
}

void net_read(Net* net, void* buf, SZT buf_len, SZT* read_len)
{
  assert(net && net->initialized);
  assert(buf && buf_len && read_len);

  (*read_len) = tls_read(net->client, buf, buf_len);
}

void net_write(Net* net, const void* buf, SZT buf_len, SZT* write_len)
{
  assert(net && net->client && net->initialized);
  assert(buf && buf_len && write_len);

  (*write_len) = tls_write(net->client, buf, buf_len);
}

void net_destroy(Net* net)
{
  assert(net && net->initialized);

  return;
  assert(net->client && net->cfg);

  U8 error = tls_close(net->client);
  assert(error == 0);

  tls_free(net->client);
  tls_config_free(net->cfg);

  net->initialized = false;
}
