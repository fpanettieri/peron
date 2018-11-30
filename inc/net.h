#pragma once

#include <tls.h>

typedef struct {
  struct tls* client;
  struct tls_config* cfg;

  bool initialized;
} Net;

void net_init(Net* net);
void net_connect(Net* net, const char* host, const char* port);
void net_read(Net* net, void* buf, SZT buflen, SZT* read);
void net_write(Net* net, const void* buf, SZT buflen, SZT* written);
void net_destroy(Net* net);
