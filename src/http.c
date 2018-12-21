#include "http.h"

HttpRequest* http_new_request(char* method, char* target, char* version, Memory* mem)
{
  assert(method && target && version && mem);
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

U32 http_get_request_size(HttpRequest* req)
{
  assert(req);

  U32 len = 0;
  len += strnlen(req->method, 8);
  len += strnlen(req->target, Kilobytes(2));
  len += strnlen(req->version, 8);
  len += 4;

  HttpHeader* header = req->headers;
  while (header) {
    len += strnlen(header->name, Kilobytes(1));
    len += strnlen(header->value, Kilobytes(1));
    len += 4;
    header = header->next;
  }

  if (!str_empty(req->body)){
    len += strnlen(req->body, Kilobytes(64));
    len += 2;
  }
  len += 3;

  return len;
}

String* http_request_to_string(HttpRequest* req, Memory* mem)
{
  assert(req && mem);

  U32 size = http_get_request_size(req);
  printf("Calculated Request Size: %u\n", size);

  String* str = str_new(size, mem);

  str_append(str, req->method, 8);
  str_append(str, " ", 1);
  str_append(str, req->target, Kilobytes(2));
  str_append(str, " ", 1);
  str_append(str, req->version, 8);
  str_append(str, "\r\n", 2);

  HttpHeader* header = req->headers;
  while (header) {
    str_append(str, header->name, Kilobytes(1));
    str_append(str, ": ", 2);
    str_append(str, header->value, Kilobytes(1));
    str_append(str, "\r\n", 2);
    header = header->next;
  }

  if (!str_empty(req->body)){
    str_append(str, req->body, Kilobytes(64));
    str_append(str, "\r\n", 2);
  }

  str_append(str, "\r\n\0", 3);
  // avoid mem reuse bugs

  printf("\nRaw Query: %lu bytes (%u offset)\n%s\n", strnlen(str->buf, 8000), str->offset, str->buf);

  return str;
}

HttpResponse* http_send(HttpRequest* req, Net* net, Memory* mem)
{
  assert(req && net && mem);

  String* str = http_request_to_string(req, mem);
  assert(str && str->len);

  SZT written = 0;
  net_write(net, str->buf, str->len, &written);
  assert(written);

  // TODO: implement proper net_read
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
