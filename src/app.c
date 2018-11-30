#include "app.h"

void app_init(App* app)
{
  app->name = "Peron";
  app->version = "0.2";

  printf("name addr %p, size %lu\n", (void*)app->name, sizeof(app->name));
  printf("version addr %p, size %lu\n", (void*)app->version, sizeof(app->version));
  printf("net addr %p, size %lu\n", (void*)&app->net, sizeof(app->net));

}

void app_debug(App* app)
{
  printf("%s v%s\n", app->name, app->version);
}
