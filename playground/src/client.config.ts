import { defineClientConfig } from "@doain/toolkit";

const APP_KEY = "playground";
const LOGIN_URL = "login";
const USER_INFO_URL = "user/info";
const LOGIN_ROUTE = "/account/login";

export default defineClientConfig(({ httpClient }) => {
  return {
    app: {
      appKey: APP_KEY,
    },
    layout: {
      data: [],
    },
    store: {
      getRequiredUserData(data) {
        return data;
      },
    },
    fetch: {
      baseUrl: "http://150.158.181.150/mock-api/",
      tokenWhiteList: [LOGIN_URL],
      async fetchUserInfo() {
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
      enableTokenAuth: false,
      unimpededRoutes: [],
      unloggedOnlyRoutes: [LOGIN_ROUTE],
    },
  };
});
