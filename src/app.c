#include "app.h"

void app_init(App* app)
{
  assert(app);

  app->name = "Peron";
  app->version = "0.2";
}

void app_debug(App* app)
{
  assert(app);
  
  printf("%s v%s\n", app->name, app->version);
}
