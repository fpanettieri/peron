#pragma once

typedef struct HttpHeader_st {
  const char* name;
  const char* value;
  struct HttpHeader_st* next;
} HttpHeader;

typedef struct {
  const char* method;
  const char* target;
  const char* protocol;
  HttpHeader* headers;
} HttpRequest;

typedef struct {
  U8 status;
} HttpResponse;
