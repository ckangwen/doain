import { defineClientConfig } from "@doain/toolkit";

import { GlobalUserInfo, RawUserInfo } from "./types";

const APP_KEY = "playground";
const LOGIN_URL = "login";
const USER_INFO_URL = "user/info";
const LOGIN_ROUTE = "/account/login";

export default defineClientConfig<GlobalUserInfo>(({ httpClient }) => {
  return {
    app: {
      appKey: APP_KEY,
    },
    layout: {
      title: "Doain",
      data: [
        {
          path: "/account/user-info",
          title: "UserInfo",
        },
      ],
    },
    store: {
      formatUserData(data) {
        const { userId, username, avatar } = data as RawUserInfo;
        return {
          username,
          userId,
          avatar,
        };
      },
    },
    fetch: {
      baseUrl: "http://150.158.181.150/mock-api/",
      tokenWhiteList: [LOGIN_URL],
      fetchUserInfo() {
        return httpClient.limitRepeatedRequest({
          url: USER_INFO_URL,
        });
      },
      login() {
        return httpClient.limitRepeatedRequest({
          url: LOGIN_URL,
        });
      },
      getTokenAfterLogin(data) {
        return data.token;
      },
    },
    router: {
      loginRoute: LOGIN_ROUTE,
      homeRoute: "/",
      enableTokenAuth: true,
      unimpededRoutes: [],
      unloggedOnlyRoutes: [LOGIN_ROUTE],
    },
  };
});
