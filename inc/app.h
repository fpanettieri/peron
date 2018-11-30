#pragma once

typedef struct {
  const char* name;
  const char* version;
  const Net net;
} App;

void app_init(App* app);
void app_debug(App* app);
