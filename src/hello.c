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
  app_debug(app);

  Net* net = &app->net;
  net_init(net);

  net_connect(net, "google.com", "443");

  SZT len = 0;
  const char* req = "GET / \n";
  net_write(net, req, sizeof(req), &len);
  printf("written: %lu\n\n", len);

  len = 0;
  char buf[4096];
  int i = 0;
  do {
    printf("\nITERATION %d:\n", i++);
    net_read(net, buf, sizeof(buf), &len);

    if (len) {
      fwrite(buf, sizeof(char), len, stdout);
    }
  } while (len > 0);

  printf("\n\nWoooohooooo\n\n");

  net_destroy(net);
  return 0;
}
