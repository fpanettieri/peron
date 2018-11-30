#include "memory.h"

#include <sys/mman.h>

# ifdef INTERNAL
const char* mem_human (U64 size, char* output)
{
  if      (size > Terabytes(1)){ snprintf(output, sizeof(output), "%.02f TB", (F64)size / Terabytes(1)); }
  else if (size > Gigabytes(1)){ snprintf(output, sizeof(output), "%.02f GB", (F64)size / Gigabytes(1)); }
  else if (size > Megabytes(1)){ snprintf(output, sizeof(output), "%.02f MB", (F64)size / Megabytes(1)); }
  else if (size > Kilobytes(1)){ snprintf(output, sizeof(output), "%.02f KB", (F64)size / Kilobytes(1)); }
  else { snprintf(output, sizeof(output), "%llu B", size); }

	return output;
}
# else
#   define mem_human(size, output)
# endif

# ifdef INTERNAL
void mem_debug (Memory* memory)
{
  assert(memory && memory->initialized);

  U32 permanent_used = (U32)sizeof(memory->permanent);
  U32 permanent_size = memory->permanent_size;
  F32 permanent_percentage = (F32)permanent_used / (F32)permanent_size * 100.0f;

  U32 transient_used = (U8*)memory->marker - (U8*)memory->transient;
  U32 transient_size = memory->transient_size;
  F32 transient_percentage = (F32)transient_used / (F32)transient_size * 100.0f;

  U32 frame_used =  (U8*)memory->permanent + memory->total_size - (U8*)memory->frame;
  U32 frame_size = memory->transient_size - transient_used;
  F32 frame_percentage = (F32)frame_used / (F32)frame_size * 100.0f;

  char used[12], size[12];
  printf("MEM [P: %s / %s (%.2f%%)", mem_human(permanent_used, used), mem_human(permanent_size, size), permanent_percentage);
  printf(" | T: %s / %s (%.2f%%)", mem_human(transient_used, used), mem_human(transient_size, size), transient_percentage);
  printf(" | F: %s / %s (%.2f%%)]\n", mem_human(frame_used, used), mem_human(frame_size, size), frame_percentage);
}
# else
#   define mem_debug(expr)
# endif

void mem_init (Memory* mem, U64 perm, U64 tmp)
{
  mem->permanent_size = perm;
  mem->transient_size = tmp;
  mem->total_size = mem->permanent_size + mem->transient_size;

# ifdef INTERNAL
  void* base_address = (void*)Terabytes(1);
# else
  void* base_address = (void*)0;
# endif

  mem->permanent = mmap(base_address, mem->total_size, PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);
  mem->transient = ((U8*) mem->permanent + mem->permanent_size);
  mem->marker = mem->transient;
  mem->frame = ((U8*) mem->permanent + mem->total_size);
  mem->initialized = true;
  assert(mem->permanent);
}

void* mem_alloc(Memory* memory, U32 size) {
  assert(memory && memory->initialized);
  assert((U8*)memory->marker + size < (U8*)memory->permanent + memory->total_size);

  void* mem = memory->marker;
  memory->marker = (void*)((U8*)memory->marker + size);
  mem_debug(memory);
  return mem;
}

void mem_free(Memory* memory, void* ptr) {
  assert(memory && memory->initialized);
  assert(ptr && ptr >= memory->transient && ptr < memory->marker);
  memory->marker = ptr;
  mem_debug(memory);
}

void* mem_tmp_alloc(Memory* memory, U32 size) {
  assert(memory && memory->initialized);
  assert((U8*)memory->frame - size > (U8*)memory->marker);
  memory->frame = (void*)((U8*)memory->frame - size);
  return memory->frame;
}

void mem_tmp_clear(Memory* memory) {
  memory->frame = (void*)((U8*)memory->permanent + memory->total_size);
}
