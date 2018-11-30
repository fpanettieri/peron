#include <stdio.h>
#include <stddef.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "app.c"
// #include "tls.c"

int main (void)
{
  Memory mem;
  mem_init(&mem, Megabytes(2), Megabytes(62));
  mem_debug(&mem);

  app_init(&mem);
  app_debug(&mem);

  // struct tls* tls;
  // struct tls_config* cfg;

  // init_tls(&tls, &cfg);

  // printf("Hello TLS!\n");
  return 0;
}
