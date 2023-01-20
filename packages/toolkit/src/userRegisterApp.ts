import type { Pinia } from "pinia";
import type { App } from "vue";
import type { Router } from "vue-router";

interface Context {
  app: App;
  router: Router;
  store: Pinia;
}

export interface RegisterOptions {
  setup: () => void;
  onAppReady: (context: Context) => void;
}

export function userRegisterApp(options: Partial<RegisterOptions>) {
  return options;
}
