import { AppLayout } from "~components";
import userSetup from "~doain/registerApp";
import router from "~doain/router";
import store from "~doain/store";
import "~doain/unocss";

import { inBrowser } from "@charrue/toolkit";
import { createApp, defineComponent, h } from "vue";

import "./globals";
import { tokenGuard, userGuard } from "./router/guards";

const DoainApp = defineComponent({
  name: "DoainApp",
  setup() {
    if (userSetup && typeof userSetup.setup === "function") {
      userSetup.setup();
    }
    return () => h(AppLayout);
  },
});

function createClientApp() {
  const app = createApp(DoainApp);

  return {
    app,
  };
}

if (inBrowser) {
  const { app } = createClientApp();
  // store先于router处理，因为router中会有依赖store的部分
  if (store) {
    app.use(store);
  }

  if (router) {
    app.use(router);

    tokenGuard(router);
    userGuard(router);
  }

  if (userSetup && typeof userSetup.onAppReady === "function") {
    userSetup.onAppReady({
      app,
      router,
      store,
    });
  }

  app.mount("#app");
}
