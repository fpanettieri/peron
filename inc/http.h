#pragma once

typedef struct HttpHeader_st {
  char* name;
  char* value;
  struct HttpHeader_st* next;
} HttpHeader;

typedef struct {
  char* method;
  char* target;
  char* version;
  HttpHeader* headers;
  char* body;
} HttpRequest;

typedef struct {
  char* version;
  char* status;
  char* reason;
  HttpHeader* headers;
} HttpResponse;

HttpRequest* http_request(char* method, char* target, char* version, Memory* mem);
void http_add_header(HttpRequest* req, char* name, char* value, Memory* mem);
HttpResponse* http_send(HttpRequest* req, Net* net, Memory* mem);
