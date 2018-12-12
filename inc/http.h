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
} HttpRequest;

typedef struct {
  char* version;
  char* status;
  char* reason;
  HttpHeader* headers;
} HttpResponse;
