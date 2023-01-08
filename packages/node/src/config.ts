import type { Options as VuePluginOptions } from "@vitejs/plugin-vue";
import type { Options as VueJsxPluginOptions } from "@vitejs/plugin-vue-jsx";
import fs from "fs-extra";
import path from "path";
import c from "picocolors";
import type { PluginVisualizerOptions } from "rollup-plugin-visualizer";
import type { VitePluginConfig as UnocssPluginOptions } from "unocss/vite";
import AutoImportPlugin from "unplugin-auto-import/vite";
import type { Options as VueComponentsOptions } from "unplugin-vue-components";
import { loadConfigFromFile, normalizePath } from "vite";
import type { UserConfigExport } from "vite";
import type { UserOptions as PagesPluginOptions } from "vite-plugin-pages";
import type { UserOptions as PageLayoutPluginOptions } from "vite-plugin-vue-layouts";

import { APP_NAME } from "./constants";
import { Awaitable, createDebug } from "./helper";

const debug = createDebug("config");

function resolve(root: string, file: string) {
  return normalizePath(path.resolve(root, `.${APP_NAME}`, file));
}

const supportedConfigExtensions = ["js", "ts", "cjs", "mjs", "cts", "mts"];

type AutoImportPluginOptions = Parameters<typeof AutoImportPlugin>[0];

export interface UserConfig {
  base?: string;
  root?: string;
  srcDir?: string;
  outDir?: string;
  cacheDir?: string;
  builtPlugins?: {
    vue?: VuePluginOptions | false;
    vueJsx?: VueJsxPluginOptions | false;
    pages?: PagesPluginOptions | false;
    pageLayout?: PageLayoutPluginOptions | false;
    unocss?: UnocssPluginOptions | false;
    autoImport?: AutoImportPluginOptions | false;
    vueComponents?: VueComponentsOptions | false;
    visualizer?: PluginVisualizerOptions | false;
  };
  vite?: UserConfigExport;
}

export interface DoainClientConfig {
  builtPlugins: UserConfig["builtPlugins"];
}

export interface DoainConfig extends UserConfig {
  configPath: string | undefined;
  configDeps: string[];
  clientConfig: DoainClientConfig;
}

export type RawConfigExports = Awaitable<UserConfig> | (() => Awaitable<UserConfig>);

export async function resolveUserConfig(
  root: string,
  command: "serve" | "build" = "serve",
  mode = "development",
): Promise<[UserConfig, string | undefined, string[]]> {
  const configPath = supportedConfigExtensions
    .map((ext) => resolve(root, `config.${ext}`))
    .find(fs.pathExistsSync);

  let userConfig: RawConfigExports = {};
  let configDeps: string[] = [];
  if (!configPath) {
    debug(`no config file found.`);
  } else {
    const configExports = await loadConfigFromFile({ command, mode }, configPath, root);
    if (configExports) {
      userConfig = configExports.config as RawConfigExports;
      configDeps = configExports.dependencies.map((file) => normalizePath(path.resolve(file)));
    }
    debug(`loaded config at ${c.yellow(configPath)}`);
  }

  return [
    await (typeof userConfig === "function" ? userConfig() : userConfig),
    configPath,
    configDeps,
  ];
}

export async function resolveDoainConfig(root: string = process.cwd()): Promise<DoainConfig> {
  const [userConfig, configPath, configDeps] = await resolveUserConfig(root);
  const srcDir = normalizePath(path.resolve(root, userConfig.srcDir || "."));
  const outDir = resolve(root, userConfig.outDir || "dist");
  const cacheDir = resolve(root, userConfig.cacheDir || "cache");
  const base = userConfig.base || "/";

  const clientConfig = resolveClientConfig(userConfig);

  userConfig.srcDir = srcDir;
  userConfig.outDir = outDir;
  userConfig.cacheDir = cacheDir;
  userConfig.base = base;

  return {
    ...userConfig,
    root: normalizePath(root),
    configPath,
    configDeps,
    clientConfig,
  };
}

export function resolveClientConfig(userConfig: UserConfig): DoainClientConfig {
  return {
    builtPlugins: userConfig.builtPlugins,
  };
}

export function defineConfig(config: UserConfig) {
  return config;
}
