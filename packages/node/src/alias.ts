import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { normalizePath } from "vite";

const currentDir = dirname(resolve(fileURLToPath(import.meta.url)));
// node_modules/@doain/node/dist/cli.js -> node_modules/@doain/client/dist/app/index.js
export const DIST_CLIENT_PATH = normalizePath(resolve(currentDir, "../../client/dist/packages"));
export const APP_INDEX_PATH = normalizePath(join(DIST_CLIENT_PATH, "client/app/index.js"));
export const APP_PATH = join(DIST_CLIENT_PATH, "app");

export const SHARED_PATH = join(DIST_CLIENT_PATH, "shared");
export const DEFAULT_THEME_PATH = join(DIST_CLIENT_PATH, "theme-default");
