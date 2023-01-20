import { Router } from "vue-router";

import { useUserStore } from "../store";

export const connectRouterStore = (router: Router) => {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    try {
      userStore.refreshUserInfo(false);
    } catch {
      //
    }

    next();
  });
};
