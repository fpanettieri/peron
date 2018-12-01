#include <stdio.h>
#include <string.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "net.c"
#include "ws.c"
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
  net_connect(net, "echo.websocket.org", "443");

  SZT len = 0;
  const char* req = "GET /?encoding=text HTTP/1.1\nhost: echo.websocket.org\nupgrade: websocket\nconnection: upgrade\nsec-websocket-key: dGhlIHNhbXBsZSBub25jZd==\norigin: https://peron.getplatita.com\nsec-websocket-protocol: platita\nsec-websocket-version: 1\n\n";
  net_write(net, req, strnlen(req, 8192), &len);
  // 
  // char buf[8192];
  // do {
  //   len = 0;
  //   net_read(net, buf, sizeof(buf), &len);
  //   if (len) { fwrite(buf, sizeof(char), len, stdout); }
  // } while (len > 0);

  net_destroy(net);
  return 0;
}
