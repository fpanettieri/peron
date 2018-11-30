#include <stdio.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "net.c"
#include "app.c"

int main (void)
{
  Memory mem;
  mem_init(&mem, Megabytes(2), Megabytes(62));
  mem_debug(&mem);

  App* app = (App*)mem.permanent;
  app_init(app);
  // app_debug(app);

  // net_init(app->net);

  // net_connect(app->net, "google.com", "443");

  // SZT len = 0;
  // net_write(app->net, "GET / \n", 8, &len);
  // printf("written: %lu\n\n", len);

  // net_destroy(app->net);
  return 0;
}
