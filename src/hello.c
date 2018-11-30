#include <stdio.h>

#include "assert.h"
#include "types.h"

#include "memory.c"
#include "net.c"
#include "app.c"

int main (void)
{
  Memory mem;
  mem_init(&mem, Megabytes(2), Megabytes(62));
  mem_debug(&mem);

  App* app = (App*)mem.permanent;
  app_init(app);
  app_debug(app);

  Net* net = &app->net;
  net_init(net);

  net_connect(net, "google.com", "443");

  // SZT len = 0;
  // net_write(net, "GET / \n", 8, &len);
  // printf("written: %lu\n\n", len);


  // if ((read = tls_read(tls, buf, sizeof(buf))) < 0)
		// goto err;

	// buf[read - 1] = '\0';
	// puts(buf);

  // net_destroy(net);
  return 0;
}
