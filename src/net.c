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

void net_handshake(Net* net)
{
  assert(net && net->initialized);
  U8 error = tls_handshake(net->client);
  assert(error == 0);
}

void net_read(Net* net, void* buf, SZT buf_len, SZT* read_len)
{
  assert(net && net->initialized);
  assert(buf && buf_len && read_len);

  printf("================================================\n");
  printf("net_read()\n");
  printf("there is space for %lu bytes\n", buf_len);

  (*read_len) = tls_read(net->client, buf, buf_len);

  // printf("%lu RAW BYTES: \n", (*read_len));
  // char* raw = (char*)buf;
  // for (U32 i = 0; i < (*read_len); i++) {
  //   printf("%d\t%c\t%d\n", i, raw[i], raw[i]);
  // }
  // printf("\n");

  printf("read %lu bytes\n", *read_len);
  printf("%s\n", (char*)buf);
  printf("================================================\n");
}

void net_write(Net* net, const void* buf, SZT buf_len, SZT* write_len)
{
  assert(net && net->client && net->initialized);
  assert(buf && buf_len && write_len);

  *write_len = 0;
  while (buf_len > 0) {
    SSZT ret = tls_write(net->client, buf, buf_len);

    if (ret == TLS_WANT_POLLIN || ret == TLS_WANT_POLLOUT){ continue; }
    if (ret < 0) { fprintf(stderr, "net_write: %s\n", tls_error(net->client)); return; }

    *write_len += ret;
    buf_len -= ret;
  }
}

void net_destroy(Net* net)
{
  assert(net && net->initialized);
  assert(net->client && net->cfg);

  // TODO: error handling was explicitly ignored during the google test
  tls_close(net->client);
  tls_free(net->client);
  tls_config_free(net->cfg);

  net->initialized = false;
}

# ifdef INTERNAL

#include <time.h>
void net_debug(Net* net, const char* name)
{
  const char* p;
	time_t time;
	struct tm *tm;

	if (tls_peer_cert_provided(net->client) == 1) {
		printf("tls_peer_cert_provided: YES\n");
	} else {
		printf("tls_peer_cert_provided: NO\n");
		return;
	}

	if (tls_peer_cert_contains_name(net->client, name) == 1) {
		printf("tls_peer_cert_contains_name: %s\n", name);
	} else {
		printf("tls_peer_cert_contains_name: invalid\n");
  }

	if ((p = tls_peer_cert_issuer(net->client)) == NULL) {
    printf("tls_peer_cert_issuer: %s", tls_error(net->client));
  } else {
    printf("tls_peer_cert_issuer: %s\n", p);
  }

	if ((p = tls_peer_cert_subject(net->client)) == NULL) {
    printf("tls_peer_cert_subject: %s", tls_error(net->client));
  } else {
    printf("tls_peer_cert_subject: %s\n", p);
  }

	if ((p = tls_peer_cert_hash(net->client)) == NULL) {
    printf("tls_peer_cert_hash: %s", tls_error(net->client));
  } else {
    printf("tls_peer_cert_hash: %s\n", p);
  }

	if ((time = tls_peer_cert_notbefore(net->client)) < 0) {
    printf("tls_peer_cert_notbefore: %s", tls_error(net->client));
  } else {
    tm = localtime(&time);
  	printf("tls_peer_cert_notbefore: %04d/%02d/%02d %02d:%02d:%02d\n", 1900 + tm->tm_year, tm->tm_mon + 1, tm->tm_mday, tm->tm_hour, tm->tm_min, tm->tm_sec);
  }

	if ((time = tls_peer_cert_notafter(net->client)) < 0) {
    printf("tls_peer_cert_notafter: %s", tls_error(net->client));
  } else {
    tm = localtime(&time);
  	printf("tls_peer_cert_notafter: %04d/%02d/%02d %02d:%02d:%02d\n", 1900 + tm->tm_year, tm->tm_mon + 1, tm->tm_mday, tm->tm_hour, tm->tm_min, tm->tm_sec);
  }

	if ((p = tls_conn_version(net->client)) == NULL) {
    printf("tls_conn_version: %s", tls_error(net->client));
  } else {
    printf("tls_conn_version: %s\n", p);
  }

	if ((p = tls_conn_cipher(net->client)) == NULL) {
    printf("tls_conn_cipher: %s", tls_error(net->client));
  } else {
    printf("tls_conn_cipher: %s\n", p);
  }
}
# else
#   define net_debug(net, name)
# endif
