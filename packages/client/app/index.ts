import router from "~doain/router";

import { createApp, defineComponent, h, onMounted } from "vue";
import { RouterView } from "vue-router";

const inBrowser = typeof window !== "undefined";

const DoainApp = defineComponent({
  name: "DoainApp",
  setup() {
    onMounted(() => {
      console.log("DoainApp mounted", router);
    });

    return () => h(RouterView);
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
  app.use(router);
  app.mount("#app");
}
