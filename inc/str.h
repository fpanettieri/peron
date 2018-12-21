#pragma once

#include <string.h>

typedef struct {
  U32 len;
  U32 offset;
  char* buf;
} String;

String* str_new(U32 buflen, Memory* mem);
void str_append(String* str, char* src, U32 maxlen);
bool str_empty(char* src);
