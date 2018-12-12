#pragma once

#include <string.h>

void str_append(char* dst, char* src, U32 maxlen, U32* offset);
bool str_empty(char* src);
