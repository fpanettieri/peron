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

    // HttpRequest* req = (HttpRequest*) mem_alloc(&mem, sizeof(HttpRequest));
    // http_init(req, "GET", "localhost", "HTTP/1.1");
    // http_header(req, "Host", "www.codecademy.com");
    //
    // HttpResponse* rsp = (HttpResponse*) mem_alloc(&mem, sizeof(HttpResponse));
    // http_send(req, net, mem, rsp);



    HttpRequest* req = http_init("GET", "localhost", "HTTP/1.1", &mem);
    http_header(req, "Host", "www.codecademy.com", &mem);
    HttpResponse* rsp = http_send(req, net, &mem);

    assert(rsp);

    /*

    // TODO: run on it's own thread. Have a method for queueing messages, and another for handling messages
    SZT len = 0;
    const char* req = "GET wss://testnet.bitmex.com/realtime HTTP/1.1\r\nHost: testnet.bitmex.com\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nOrigin: https://peron.getplatita.com\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: +swGYf0e+rThyDBr37JbgA==\r\n\r\n";
    net_write(net, req, strnlen(req, 8192), &len);

    char buf[8192];
    do {
      len = 0;
      net_read(net, buf, sizeof(buf), &len);
      //if (len) { fwrite(buf, sizeof(char), len, stdout); }
    } while (len > 0);

    */

    mem.marker = mem_marker;
  }


  net_destroy(net);
  return 0;
}
