import { Default404, GlobalLayout, GlobalPureLayout } from "~components";

import { setupLayouts } from "virtual:generated-layouts";
import generatedRoutes from "virtual:generated-pages";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = setupLayouts(generatedRoutes).map((route) => {
  if (route.meta?.layout === "pure") {
    route.component = GlobalPureLayout;
  }
  if (!route.meta?.layout) {
    route.component = GlobalLayout;
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
