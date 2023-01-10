import { AppLayout } from "~components";
import userSetup from "~doain/registerApp";
import router from "~doain/router";
import store from "~doain/store";
import "~doain/unocss";

import { createApp, defineComponent, h } from "vue";

import "./globals";

const inBrowser = typeof window !== "undefined";

const DoainApp = defineComponent({
  name: "DoainApp",
  setup() {
    if (typeof userSetup.setup === "function") {
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
  }
  if (store) {
    app.use(store);
  }

  if (typeof userSetup.onAppReady === "function") {
    userSetup.onAppReady({
      app,
      router,
      store,
    });
  }

  app.mount("#app");
}
