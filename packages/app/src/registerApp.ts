import { APP_KEY } from "~constants";

import { defineLayoutConfig } from "@charrue/layout-next";
import { defineEffectiveConfig, request } from "@effective/client";
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

defineEffectiveConfig({
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
    async fetchUserInfo() {
      const [data, err] = await request("/client/info");
      if (err) {
        return {};
      }
      return data.data || {};
    },
    async login(data) {
      const res = await request("/user/login", data);
      return res;
    },
    getTokenAfterLogin(response) {
      return response.data?.token || "";
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
