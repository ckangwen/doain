import type { AxiosAdapter } from "axios";
import type { RouteLocationRaw } from "vue-router";

import type { HttpClientResponse } from "../request/index";
import type { GlobalUserInfo } from "../store/index";
import { createGlobalConfigFactory } from "./createGlobalConfigFactory";

interface DoainConfig {
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
    // TODO: UserInfo类型
    getRequiredUserData: (userInfo: Record<string, any>) => GlobalUserInfo;
  };
  fetch: {
    baseUrl: string;
    adaptor?: AxiosAdapter;
    tokenWhiteList?: string[];
    fetchUserInfo: () => Promise<HttpClientResponse>;
    login: (data: any) => Promise<HttpClientResponse>;
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

const APP_KEY = "doain-admin";

export const [defineDoainConfig, getDoainConfig, onDoainConfigChange] =
  createGlobalConfigFactory<DoainConfig>({
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
      tokenWhiteList: [],
      fetchUserInfo() {
        return Promise.resolve({
          success: false,
          data: null,
          error: null,
          message: "",
        });
      },
      login() {
        return Promise.resolve({
          success: false,
          data: null,
          error: null,
          message: "",
        });
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
