import { Default404 } from "~components";
import routes from "~pages";

import { createRouter, createWebHashHistory } from "vue-router";

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
