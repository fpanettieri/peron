#include "http.h"

HttpRequest* http_init(const char* method, const char* url, const char* protocol, Memory* mem)
{
  HttpRequest* req = (HttpRequest*) mem_alloc(mem, sizeof(HttpRequest));
  req->method = method;
  req->url = url;
  req->protocol = protocol;
  return req;
}

void http_header(HttpRequest* req, const char* key, const char* value, Memory* mem)
{
  assert(req && key && value && mem);
}

HttpResponse* http_send(HttpRequest* req, Net* net, Memory* mem)
{
  assert(req && net && mem);
  HttpResponse* rsp = (HttpResponse*) mem_alloc(mem, sizeof(HttpResponse));
  return rsp;
}


// char req[ SOME_SUITABLE_SIZE ];
// sprintf( req, HTTP_GET_MSG, host, path );
