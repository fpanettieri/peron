#include "http.h"

HttpRequest* http_init(char* method, char* target, char* version, Memory* mem)
{
  HttpRequest* req = (HttpRequest*) mem_alloc(mem, sizeof(HttpRequest));
  req->method = method;
  req->target = target;
  req->version = version;
  req->headers = NULL;
  req->body = NULL;
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

  // { // TODO: Extract to its own method
    // TODO: calculate how much space is needed
    char* raw = (char*) mem_alloc(mem, 8000);
    SZT offset = 0;

    str_append(raw, req->method, 8, &offset);
    str_append(raw, " ", 7, &offset);
    str_append(raw, req->target, 2048, &offset);
    str_append(raw, " ", 7, &offset);
    str_append(raw, req->version, 8, &offset);
    str_append(raw, "\r\n", 2, &offset);

    HttpHeader* header = req->headers;
    while (header) {
      str_append(raw, header->name, 1024, &offset);
      str_append(raw, ": ", 2, &offset);
      str_append(raw, header->value, 1024, &offset);
      str_append(raw, "\r\n", 2, &offset);
      header = header->next;
    }

    if (!str_empty(req->body)){
      str_append(raw, req->body, 4096, &offset);
      str_append(raw, "\r\n", 2, &offset);
    }

    str_append(raw, "\r\n", 2, &offset);

    // avoid mem reuse bugs
    raw[offset] = '\0';

    printf("\nRaw Query: %lu bytes (%lu offset)\n%s\n", strnlen(raw, 8000), offset, raw);
  // } Build http message

  SZT written = 0;
  net_write(net, raw, offset, &written);

  SZT read = 0;
  char read_buf[8192];
  do {
    read = 0;
    net_read(net, read_buf, sizeof(read_buf), &read);
    //if (len) { fwrite(buf, sizeof(char), len, stdout); }
  } while (read > 0);


  // TODO:
  // -. build the query
  // -. send it
  // 2. read and package the response

  // TODO: append headers to req
  // HttpHeader* header = req.headers;
  // while (header) {
  //  last = last->next
  // }
  // last = header;


  /*

  // TODO: run on it's own thread. Have a method for queueing messages, and another for handling messages
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
