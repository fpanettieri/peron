#include "ws.h"

void ws_handshake(Net* net)
{
  SZT len = 0;
  const char* req = "GET / HTTP/1.1\nHOST: www.google.com\nConnection: close\n\n";
  net_write(net, req, strnlen(req, 8192), &len);

  char buf[8192];
  do {
    len = 0;
    net_read(net, buf, sizeof(buf), &len);
    if (len) { fwrite(buf, sizeof(char), len, stdout); }
  } while (len > 0);
}

// Ws* ws = ... ?
// ws_handshake(net, "www.google.com", "4433");
