#pragma once

typedef struct HttpHeader_st {
  const char* name;
  const char* value;
  struct HttpHeader_st* next;
} HttpHeader;

typedef struct {
  const char* method;
  const char* target;
  const char* version;
  HttpHeader* headers;
} HttpRequest;

typedef struct {
  const char* version;
  const char* status;
  const char* reason;
  HttpHeader* headers;
} HttpResponse;
