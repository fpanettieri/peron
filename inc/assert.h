#pragma once

#if INTERNAL
#define assert(expr) if(!(expr)){ __builtin_trap(); }
#else
#define assert(expr)
#endif
