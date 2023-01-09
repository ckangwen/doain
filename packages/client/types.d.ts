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
declare module "virtual:doain" {
  const content: {
    builtPlugins?: {
      vue?: Record<string, any> | false;
      vueJsx?: Record<string, any> | false;
      pages?: Record<string, any> | false;
      pageLayout?: Record<string, any> | false;
      unocss?: Record<string, any> | false;
      autoImport?: Record<string, any> | false;
      vueComponents?: Record<string, any> | false;
      visualizer?: Record<string, any> | false;
    };
    root: string;
  };
  export default content;
}

declare module "~doain/router" {
  import type { Router } from "vue-router";

  const router: Router;
  export default router;
}
