#include "str.h"

void str_append(char* dst, char* src, U32 maxlen, SZT* offset)
{
  U32 len = strnlen(src, maxlen);
  memcpy(&dst[*offset], src, len);
  *offset += len;
}

bool str_empty(char* src)
{
  return src == NULL || src[0] == '\0';
}
