#include <stdio.h>
#include <string.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "net.c"
#include "http.c"
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
  net_connect(net, "localhost", "8443");

  // Store
  {
    void* mem_marker = mem.marker;

    HttpRequest* req = http_init("GET", "localhost", "HTTP/1.1", &mem);
    http_add_header(req, "Host", "testnet.bitmex.com", &mem);
    http_add_header(req, "User-Agent", "peron 0.1", &mem);
    HttpResponse* rsp = http_send(req, net, &mem);

    // TODO: detect if it's a good answer

    assert(rsp);
    mem.marker = mem_marker;
  }


  net_destroy(net);
  return 0;
}
