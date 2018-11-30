#include "app.h"

void app_init(Memory* mem)
{
  App* app = (App*) mem->permanent;
  app->name = "Peron";
  app->version = "0.2";
}

void app_debug(Memory* mem)
{
  App* app = (App*) mem->permanent;
  printf("%s %s\n", app->name, app->version);
}
