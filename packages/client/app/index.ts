import { AppLayout } from "~components";
import userClientConfig from "~doain/clientConfig";
import userSetup from "~doain/registerApp";
import router from "~doain/router";
import store from "~doain/store";
import "~doain/unocss";

import { inBrowser } from "@charrue/toolkit";
import { routerTokenGuard } from "@doain/toolkit";
import { createApp, defineComponent, h } from "vue";

import "./globals";

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
  if (router) {
    app.use(router);

    routerTokenGuard(router, userClientConfig);
  }
  if (store) {
    app.use(store);
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
