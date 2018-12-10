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
  // net_connect(net, "testnet.bitmex.com", "443");
  net_connect(net, "localhost", "8443");

  // TODO: run on it's own thread. Have a method for queueing messages, and another for handling messages
  SZT len = 0;
  const char* req = "GET wss://testnet.bitmex.com/realtime HTTP/1.1\nHost: testnet.bitmex.com\nConnection: Upgrade\nUpgrade: websocket\nOrigin: https://peron.getplatita.com\nSec-WebSocket-Version: 13\nSec-WebSocket-Key: +swGYf0e+rThyDBr37JbgA==\n\n\n";
  net_write(net, req, strnlen(req, 8192), &len);

  char buf[8192];
  do {
    len = 0;
    net_read(net, buf, sizeof(buf), &len);
  } while (len > 0);

  net_destroy(net);
  return 0;
}
