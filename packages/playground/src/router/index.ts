import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: "/",
      component: () => import("../modules/index.vue"),
    },
  ],
});

export default router;
