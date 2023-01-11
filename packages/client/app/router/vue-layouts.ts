import { Default404, GlobalLayout, GlobalPureLayout } from "~components";

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
  if (route.meta?.layout === "pure") {
    return {
      ...route,
      component: GlobalPureLayout,
    } as unknown as RouteRecordRaw;
  }
  return route;
});

routes.push({
  path: "/page-not-found",
  name: "PageNotFound",
  component: Default404,
});

routes.push({
  path: "/:pathMatch(.*)*",
  redirect: "/page-not-found",
});

const router = createRouter({
  history: createWebHashHistory(),

  routes,
});

export default router;
