declare module "~pages" {
  import type { RouteRecordRaw } from "vue-router";

  const routes: RouteRecordRaw[];
  export default routes;
}

declare module "pages-generated" {
  import type { RouteRecordRaw } from "vue-router";

  const routes: RouteRecordRaw[];
  export default routes;
}

declare module "virtual:generated-pages" {
  import type { RouteRecordRaw } from "vue-router";

  const routes: RouteRecordRaw[];
  export default routes;
}

declare module "virtual:generated-layouts" {
  import type { RouteRecordRaw } from "vue-router";

  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[];
}

declare module "~doain/router" {
  import type { Router } from "vue-router";

  const router: Router;
  export default router;
}

declare module "~doain/store" {
  import type { Pinia } from "pinia";

  const store: Pinia;
  export default store;
}
