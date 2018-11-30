#pragma once

#define Kilobytes(Value) ((Value)*1024LL)
#define Megabytes(Value) (Kilobytes(Value)*1024LL)
#define Gigabytes(Value) (Megabytes(Value)*1024LL)
#define Terabytes(Value) (Gigabytes(Value)*1024LL)

typedef signed char         I8;
typedef signed short        I16;
typedef signed int          I32;
typedef signed long         I64;

typedef unsigned char       U8;
typedef unsigned short      U16;
typedef unsigned int        U32;
typedef unsigned long long  U64;

typedef float               F32;
typedef double              F64;

#ifndef bool
  typedef signed char         bool;
# define true  1
# define false 0
#endif
