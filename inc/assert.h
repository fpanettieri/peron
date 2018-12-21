#pragma once

#if INTERNAL
#define assert(expr) if(!(expr)){ printf("\nassertion failed %s:%d\n\n", __FILE__, __LINE__); __builtin_trap(); }
#else
#define assert(expr)
#endif
