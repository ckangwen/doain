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

declare module "~doain/registerApp" {
  import type { Pinia } from "pinia";
  import type { App } from "vue";
  import type { Router } from "vue-router";

  interface Context {
    app: App;
    router: Router;
    store: Pinia;
  }

  interface UserSetupOptions {
    setup: () => void;
    onAppReady: (context: Context) => void;
  }

  const options: Partial<UserSetupOptions>;
  export default options;
}

declare module "uno.css" {
  const content: any;
  export default content;
}

declare module "~doain/unocss" {
  const content: any;
  export default content;
}

declare module "~doain/clientConfig" {
  import type { DoainConfig } from "@doain/toolkit";

  const config: DoainConfig;
  export default config;
}
