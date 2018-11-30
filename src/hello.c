#include <stdio.h>

// #include "tls.c"

#include "assert.h"
#include "types.h"

#include "memory.c"

typedef struct {
  const char* name;
  const char* version;
} App;

void foo(Memory* mem)
{
  App* app = (App*) mem->permanent;
  printf("%s %s\n", app->name, app->version);
}

int main (void)
{
  Memory mem;
  mem_init(&mem, Megabytes(2), Megabytes(62));
  mem_debug(&mem);

  App* app = (App*) mem.permanent;
  app->name = "Peron";
  app->version = "0.2";

  foo(&mem);

  mem_debug(&mem);

  // struct tls* tls;
  // struct tls_config* cfg;

  // init_tls(&tls, &cfg);

  // printf("Hello TLS!\n");
  return 0;
}
