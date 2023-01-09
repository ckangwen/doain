import { GlobalLayout } from "~components";

import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

const routes = setupLayouts(generatedRoutes).map((route) => {
  if (!route.meta?.layout) {
    return {
      ...route,
      component: GlobalLayout,
    } as unknown as RouteRecordRaw;
  }
  return route;
});

const router = createRouter({
  history: createWebHashHistory(),

  routes,
});

export default router;
