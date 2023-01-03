import { Router } from "vue-router";

import { useUserStore } from "./user";

// TODO: 是否需要在每次路由跳转时，刷新用户信息
// 是否可以放到App.vue中，只在初始化时刷新一次
export const connectRouterStore = (router: Router) => {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    userStore.refreshUserInfo();

    next();
  });
};

export * from "./user";
