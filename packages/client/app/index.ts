import { AppLayout } from "~components";
import "~doain/registerApp";
import router from "~doain/router";
import store from "~doain/store";

import { createApp, defineComponent, h } from "vue";

const inBrowser = typeof window !== "undefined";

const DoainApp = defineComponent({
  name: "DoainApp",
  setup() {
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

  app.mount("#app");
}
