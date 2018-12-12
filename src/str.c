#include "str.h"

void str_append(char* dst, char* src, U32 maxlen, U32* offset)
{
  U32 len = strnlen(src, maxlen);
  memcpy(&dst[*offset], src, len);
  *offset += len;
  printf("str_append %u\t%s\n", len, src);
}

bool str_empty(char* src)
{
  return src == NULL || src[0] == '\0';
}
