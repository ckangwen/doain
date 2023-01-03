import type { PlainObject } from "@effective/shared";
import type { AxiosAdapter } from "axios";
import type { RouteLocationRaw } from "vue-router";

import type { GlobalUserInfo } from "../store/index";
import { createGlobalConfigFactory } from "./createGlobalConfigFactory";

interface EffectiveConfig {
  app: {
    appKey: string;
    storageKey: string;
    version: string;
  };
  layout: {
    [key: string]: any;
    tabViewStorageName: string;
    ignoreNavigationTabKey: string;
  };
  store: {
    getRequiredUserData: (userInfo: PlainObject) => GlobalUserInfo;
  };
  fetch: {
    baseUrl: string;
    adaptor?: AxiosAdapter;
    fetchUserInfo: () => Promise<any>;
    login: (data: any) => Promise<any>;
    getTokenAfterLogin: (data: any) => string | Promise<string>;
  };
  component?: {
    paginationView?: {
      formatColumnValue?: (key: string, value: any) => any;
      formatQueryValue?: (key: string, value: any) => any;
    };
  };
  router: {
    /** 登录页路由 */
    loginRoute: RouteLocationRaw;
    /** 首页路由 */
    homeRoute: RouteLocationRaw;
    /** 路由跳转前是否需要判断token */
    tokenAuth: boolean;
    /** 无论是否有token，都可以直接访问  */
    unimpededRoutes?: string[];
    /**
     * 只能在未登录情况下访问的页面
     * 如果已登录，访问这些页面会自动跳转到homeRoute
     * */
    unloggedRoutes?: string[];
  };
}

const APP_KEY = "effective-admin";

export const [defineEffectiveConfig, getEffectiveConfig, onEffectiveConfigChange] =
  createGlobalConfigFactory<EffectiveConfig>({
    app: {
      appKey: APP_KEY,
      storageKey: APP_KEY,
      version: "0.0.1",
    },
    layout: {
      logo: "https://element-plus.org/images/element-plus-logo.svg",
      title: "Charrue Admin",
      collapse: false,
      layout: "mix",
      sidebarWidth: [54, 200],
      tabViewStorageName: "tabView",
      ignoreNavigationTabKey: "navigationTab",
      sidebarMenu: [],
    },
    fetch: {
      baseUrl: "",
      fetchUserInfo() {
        return Promise.resolve();
      },
      login() {
        return Promise.resolve();
      },
      getTokenAfterLogin() {
        return "";
      },
    },
    store: {
      getRequiredUserData() {
        return {
          userId: 0,
          username: "",
        };
      },
    },
    router: {
      loginRoute: "/account/login",
      homeRoute: "/",
      tokenAuth: true,
    },
  });
