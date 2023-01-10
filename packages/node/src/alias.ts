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

export const DIST_CLIENT_PATH = normalizePath(resolve(currentDir, "../../client/dist"));
export const APP_INDEX_PATH = normalizePath(join(DIST_CLIENT_PATH, "app/index.js"));
export const APP_PATH = join(DIST_CLIENT_PATH, "app");

export const SHARED_PATH = join(DIST_CLIENT_PATH, "shared");
export const DEFAULT_THEME_DIR = join(DIST_CLIENT_PATH, "theme");

/**
 * 根据是否启用`vite-plugin-pages`,`vite-plugin-vue-layouts`
 * 加载不同的router
 *
 * 如果这两个插件都不启用，则优先加载`src/router/index`的默认导出的router
 */
function getRouterPath(
  root: string,
  pages: DoainConfig["builtPlugins"]["pages"],
  pageLayout: DoainConfig["builtPlugins"]["pageLayout"],
) {
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
  return routerPath;
}

/**
 * 优先加载`src/store/index`的默认导出的store
 */
function getStorePath(root: string) {
  const defaultPath = join(DIST_CLIENT_PATH, "app/store/original.js");
  const userPath = ["ts", "js"]
    .map((ext) => join(root, `src/store/index.${ext}`))
    .find(fs.pathExistsSync);
  return userPath || defaultPath;
}

function getRegisterAppPath(root: string) {
  const defaultPath = join(DIST_CLIENT_PATH, "app/registerApp.js");
  const userPath = ["ts", "js"]
    .map((ext) => join(root, `src/registerApp.${ext}`))
    .find(fs.pathExistsSync);

  return userPath || defaultPath;
}
function getUnocssPath(unocss: DoainConfig["builtPlugins"]["unocss"]) {
  if (unocss === false) {
    return join(DIST_CLIENT_PATH, "app/unocss/disable.js");
  }
  return join(DIST_CLIENT_PATH, "app/unocss/enable.js");
}

export function createClientAlias(config: DoainConfig): Alias[] {
  const { root, builtPlugins } = config;
  const { pages, pageLayout, unocss } = builtPlugins;

  const alias = [
    {
      find: "~doain/router",
      replacement: getRouterPath(root, pages, pageLayout),
    },
    {
      find: "~doain/store",
      replacement: getStorePath(root),
    },
    {
      find: "~doain/registerApp",
      replacement: getRegisterAppPath(root),
    },
    {
      find: "~doain/unocss",
      replacement: getUnocssPath(unocss),
    },
  ];

  return alias;
}
