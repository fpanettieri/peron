#pragma once

typedef struct {
  const char* name;
  const char* version;
} App;

void app_init(Memory* mem);
void app_debug(Memory* mem);
