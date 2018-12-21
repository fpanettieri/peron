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

HttpRequest* http_new_request(char* method, char* target, char* version, Memory* mem);
void http_add_header(HttpRequest* req, char* name, char* value, Memory* mem);
U32 http_get_request_size(HttpRequest* req);
String* http_request_to_string(HttpRequest* req, Memory* mem);
HttpResponse* http_send(HttpRequest* req, Net* net, Memory* mem);
