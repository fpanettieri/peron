#include <stdio.h>
#include <string.h>

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
  net_connect(net, "prosky.co", "443");

  ws_handshake(net);

  SZT len = 0;
  const char* req = "GET / HTTP/1.1\nHOST: prosky.co\nConnection: close\n\n";
  net_write(net, req, strnlen(req, 8192), &len);

  char buf[8192];
  do {
    len = 0;
    net_read(net, buf, sizeof(buf), &len);
    if (len) { fwrite(buf, sizeof(char), len, stdout); }
  } while (len > 0);

  net_destroy(net);
  return 0;
}
