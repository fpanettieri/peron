#pragma once

#include <tls.h>

typedef struct {
  struct tls* client;
  struct tls_config* cfg;

  bool initialized;
} Net;

void net_init(Net* net);
void net_destroy(Net* net);
