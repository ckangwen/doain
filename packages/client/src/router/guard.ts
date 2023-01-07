import { RouteLocationNormalized, Router } from "vue-router";

import { getDoainConfig } from "../config/index";
import { getToken } from "../helpers/index";

export const routerTokenGuard = (router: Router) => {
  const globalConfig = getDoainConfig();
  const { tokenAuth } = globalConfig.router;
  const { homeRoute, loginRoute, unimpededRoutes = [], unloggedRoutes = [] } = globalConfig.router;
  if (tokenAuth === false) {
    return;
  }

  const isUnloggedRoute = (route: RouteLocationNormalized) =>
    unloggedRoutes.some((item) => {
      if (item.startsWith("/")) {
        return item === route.path;
      }
      return item === route.name;
    });

  const isUnimpededRoute = (route: RouteLocationNormalized) =>
    unimpededRoutes.some((item) => {
      if (item.startsWith("/")) {
        return item === route.path;
      }
      return item === route.name;
    });

  router.beforeEach((to, from, next) => {
    const hasLogin = !!getToken();
    const isUnlogged = isUnloggedRoute(to);
    const isUnimpeded = isUnimpededRoute(to);
    if (isUnimpeded) {
      next();
      return;
    }

    // 如果是 仅未登录可访问的页面
    if (isUnlogged) {
      if (hasLogin) {
        next(homeRoute);
      } else {
        next();
      }
      return;
    }

    // 是其他正常的页面，如果未登录，跳转到登录页面
    if (hasLogin) {
      next();
    } else {
      next(loginRoute);
    }
  });
};
