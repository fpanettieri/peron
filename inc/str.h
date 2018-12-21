#pragma once

#include <string.h>

typedef struct {
  U32 len;
  U32 offset;
  char* buf;
} String;

void str_append(char* dst, char* src, U32 maxlen, SZT* offset);
bool str_empty(char* src);
