#include "str.h"

void str_append(char* src, U32 maxlen, char* dst, U32* offset)
{
  U32 len = strnlen(src, maxlen);
  memcpy(&dst[*offset], src, len);
  *offset += len;
  printf("str_append %u\t%s\n", len, src);
}
