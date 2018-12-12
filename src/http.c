#include "http.h"

HttpRequest* http_init(char* method, char* target, char* version, Memory* mem)
{
  HttpRequest* req = (HttpRequest*) mem_alloc(mem, sizeof(HttpRequest));
  req->method = method;
  req->target = target;
  req->version = version;
  req->headers = NULL;
  return req;
}

void http_add_header(HttpRequest* req, char* name, char* value, Memory* mem)
{
  assert(req && name && value && mem);
  HttpHeader* header = (HttpHeader*) mem_alloc(mem, sizeof(HttpHeader));
  header->name = name;
  header->value = value;
  header->next = NULL;

  HttpHeader** last = &req->headers;
  while (*last) { last = &(*last)->next; }
  *last = header;
}

HttpResponse* http_send(HttpRequest* req, Net* net, Memory* mem)
{
  assert(req && net && mem);

  { // TODO: Extract to its own method
    // TODO: calculate how much space is needed
    char* raw = (char*) mem_alloc(mem, 8000);
    U32 offset = 0;

    // TODO: implement this str_append method
    str_append(req->method, 8, raw, &offset);
    str_append(" ", 7, raw, &offset);
    str_append(req->target, 2048, raw, &offset);
    str_append(" ", 7, raw, &offset);
    str_append(req->version, 8, raw, &offset);
    str_append("\r\n", 7, raw, &offset);

    printf("\nRaw Query: %lu bytes\n%s\n", strnlen(raw, 8000), raw);
  }



  // memcpy(&destination[position], temp, strnlen(temp));

  // char req[ SOME_SUITABLE_SIZE ];
  // snprintf("%s %s %s\r\n", SOME_SUITABLE_SIZE, req->method, req->url, req->protocol);

  // TODO: build the query
  // send it
  // read and package the response

  // TODO: append headers to req
  // HttpHeader* header = req.headers;
  // while (header) {
  //  last = last->next
  // }
  // last = header;


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

  HttpResponse* rsp = (HttpResponse*) mem_alloc(mem, sizeof(HttpResponse));
  return rsp;
}


// char req[ SOME_SUITABLE_SIZE ];
// sprintf( req, HTTP_GET_MSG, host, path );
