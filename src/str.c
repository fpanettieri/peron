#include "str.h"

void str_append(String* str, char* src, U32 maxlen)
{
  U32 len = strnlen(src, maxlen);
  assert(str->offset + len < str->len);
  memcpy(&dst[*offset], src, len);
  str->offset += len;
}

bool str_empty(char* src)
{
  return src == NULL || src[0] == '\0';
}

String* str_new(U32 buflen, Memory* mem)
{
  String* str = (String*) mem_alloc(mem, sizeof(String));
  str->buf = (char*) mem_alloc(mem, buflen);
  str->len = 0;
  str->offset = 0;
  return str;
}
