#pragma once

typedef struct {
  U32 permanent_size;
  U32 transient_size;
  U32 total_size;

  void* permanent;
  void* transient;
  void* marker;
  void* frame;

  bool initialized;
} Memory;

const char* mem_human(U64 size, SZT max, char* output);
void  mem_debug(Memory* memory);

void  mem_init (Memory* mem, U64 perm, U64 tmp);
void* mem_alloc(Memory* memory, U32 size);
void  mem_free(Memory* memory, void* ptr);

void* mem_tmp_alloc(Memory* memory, U32 size);
void  mem_tmp_clear(Memory* memory);

#ifndef MAP_ANONYMOUS
#define MAP_ANONYMOUS MAP_ANON
#endif
