import { RouteLocationNormalized, Router } from "vue-router";

import { DoainClientConfig } from "../config";
import { getToken } from "../token";

export const routerTokenGuard = (router: Router, userClientConfig: DoainClientConfig) => {
  if (userClientConfig.router.enableTokenAuth !== true) {
    return;
  }
  const isUnloggedRoute = (route: RouteLocationNormalized) =>
    (userClientConfig.router.unloggedOnlyRoutes || []).some((item) => {
      if (item.startsWith("/")) {
        return item === route.path;
      }
      return item === route.name;
    });
  const isUnimpededRoute = (route: RouteLocationNormalized) =>
    (userClientConfig.router.unimpededRoutes || []).some((item) => {
      if (item.startsWith("/")) {
        return item === route.path;
      }
      return item === route.name;
    });

  router.beforeEach((to, from, next) => {
    if (userClientConfig.router.enableTokenAuth !== true) {
      next();
      return;
    }
    console.log("routerTokenGuard", to);
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
        next(userClientConfig?.router?.homeRoute || "/");
      } else {
        next();
      }
      return;
    }
    // 是其他正常的页面，如果未登录，跳转到登录页面
    if (hasLogin) {
      next();
    } else {
      next(userClientConfig?.router?.loginRoute || "/account/login");
    }
  });
};
