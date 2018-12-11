#pragma once

typedef struct {
  const char* method;
  const char* url;
  const char* protocol;
} HttpRequest;

typedef struct {
  U8 status;
} HttpResponse;
