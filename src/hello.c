#include <stdio.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "str.c"
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

  char* host = "localhost";
  char* port = "3000";
  net_connect(net, host, port);

  // Store
  {
    void* mem_marker = mem.marker;

    HttpRequest* req = http_init("GET", "/", "HTTP/1.1", &mem);
    http_add_header(req, "Host", host, &mem);
    // http_add_header(req, "Upgrade", "websocket", &mem);
    // http_add_header(req, "Connection", "Upgrade", &mem);
    // http_add_header(req, "Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==", &mem);
    // http_add_header(req, "Sec-WebSocket-Version", "13", &mem);
    http_add_header(req, "Origin", "peron.getplatita.com", &mem);
    http_add_header(req, "User-Agent", "peron 0.1", &mem);

    HttpResponse* rsp = http_send(req, net, &mem);

    // TODO: detect if it's a good answer (aka status == 101)

    assert(rsp);
    mem.marker = mem_marker;
  }


  net_destroy(net);
  return 0;
}
