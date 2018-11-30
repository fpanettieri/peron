#pragma once

#include <tls.h>

typedef struct {
  struct tls* client;
  struct tls_config* cfg;

  bool initialized;
} Net;

void net_init(Net* net);
void net_connect(Net* net, const char* host, const char* port);
void net_handshake(Net* net);
void net_read(Net* net, void* buf, SZT buf_len, SZT* read_len);
void net_write(Net* net, const void* buf, SZT buf_len, SZT* write_len);
void net_destroy(Net* net);
void net_debug(Net* net, const char* name);
