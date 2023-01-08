import doainClientConfig from "virtual:doain";
import { createApp, defineComponent, h, onMounted } from "vue";

const inBrowser = typeof window !== "undefined";

const DoainApp = defineComponent({
  name: "DoainApp",
  setup() {
    onMounted(() => {
      console.log("DoainApp mounted");
    });

    return () => h("div", "Hello DoainApp");
  },
});

async function createClientApp() {
  const app = createApp(DoainApp);
  let router;
  const { pages, pageLayout } = doainClientConfig.builtPlugins;
  if (pages && pageLayout) {
    const routerModule = await import("./router/vue-layouts.js");
    router = routerModule.default;
  }
  if (pages && pageLayout === false) {
    const routerModule = await import("./router/pages.js");
    router = routerModule.default;
  }

  return {
    app,
    router,
  };
}

if (inBrowser) {
  createClientApp().then(({ app, router }) => {
    app.use(router);

    app.mount("#app");
  });
}
