#pragma once

#include <tls.h>

typedef struct {
  struct tls* client;
} Net;

int net_init (Net* tls);
