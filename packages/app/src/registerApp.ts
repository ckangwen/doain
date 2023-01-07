import { APP_KEY } from "~constants";

import { defineLayoutConfig } from "@charrue/layout-next";
import { defineDoainConfig, httpClient } from "@doain/client";
import "@unocss/reset/tailwind.css";
import "element-plus/dist/index.css";
// https://github.com/Remix-Design/remixicon
import "remixicon/fonts/remixicon.css";
import "uno.css";

const sidebarMenu = defineLayoutConfig([
  {
    path: "/demo/demo1",
    title: "demo",
  },
]);

const LOGIN_URL = "/user/login";
const USERINFO_URL = "/client/info";

defineDoainConfig({
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
    sidebarMenu,
  },
  fetch: {
    baseUrl: "https://dingdang.hndhi.cn/api_app",
    tokenWhiteList: [LOGIN_URL],
    async fetchUserInfo() {
      const { data, success } = await httpClient.limitRepeatedRequest({
        url: USERINFO_URL,
      });
      if (!success) {
        return {};
      }
      return data || {};
    },
    async login(data) {
      const res = await httpClient.request({
        url: LOGIN_URL,
        data,
      });
      return res;
    },
    getTokenAfterLogin(data) {
      return data?.token || "";
    },
  },
  store: {
    getRequiredUserData(data) {
      return {
        userId: data?.user_id,
        username: data?.name,
      };
    },
  },
  router: {
    loginRoute: "/account/login",
    homeRoute: "/",
    tokenAuth: true,
    unloggedRoutes: ["/account/login"],
  },
});
