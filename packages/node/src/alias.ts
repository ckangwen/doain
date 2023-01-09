import fs from "fs-extra";
import { join as _join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { normalizePath } from "vite";
import type { Alias } from "vite";

import type { DoainConfig } from "./config";

const join = (...args: Parameters<typeof _join>) => {
  return normalizePath(_join(...args));
};

const currentDir = dirname(resolve(fileURLToPath(import.meta.url)));

// node_modules/@doain/node/dist/cli.js -> node_modules/@doain/client/dist/app/index.js
export const DIST_CLIENT_PATH = normalizePath(
  resolve(currentDir, "../../client/dist/packages/client"),
);
export const APP_INDEX_PATH = normalizePath(join(DIST_CLIENT_PATH, "app/index.js"));
export const APP_PATH = join(DIST_CLIENT_PATH, "app");

export const SHARED_PATH = join(DIST_CLIENT_PATH, "shared");
export const DEFAULT_THEME_DIR = join(DIST_CLIENT_PATH, "theme");

export function createClientAlias(config: DoainConfig): Alias[] {
  const { root, builtPlugins } = config;
  const { pages, pageLayout } = builtPlugins;
  let routerPath = join(DIST_CLIENT_PATH, "app/router/original.js");
  if (pages && pageLayout) {
    routerPath = join(DIST_CLIENT_PATH, "app/router/vue-layouts.js");
  }
  if (pages && pageLayout === false) {
    routerPath = join(DIST_CLIENT_PATH, "app/router/pages.js");
  }
  if (pages === false && pageLayout === false) {
    const userRouter = ["ts", "js"]
      .map((ext) => join(root, `src/router/index.${ext}`))
      .find(fs.pathExistsSync);
    if (userRouter) {
      routerPath = userRouter;
    }
  }

  const alias = [
    {
      find: "~doain/router",
      replacement: routerPath,
    },
  ];

  return alias;
}
