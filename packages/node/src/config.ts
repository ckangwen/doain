import type { VitePluginConfig as UnocssPluginOptions } from "@unocss/vite";
import type { Options as VuePluginOptions } from "@vitejs/plugin-vue";
import type { Options as VueJsxPluginOptions } from "@vitejs/plugin-vue-jsx";
import fs from "fs-extra";
import path from "path";
import c from "picocolors";
import type { PluginVisualizerOptions } from "rollup-plugin-visualizer";
import type { SetRequired } from "type-fest";
import AutoImportPlugin from "unplugin-auto-import/vite";
import type { Options as VueComponentsOptions } from "unplugin-vue-components";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { UserConfigExport, loadConfigFromFile, normalizePath } from "vite";
import type { BuildOptions } from "vite";
import type { UserOptions as PagesPluginOptions } from "vite-plugin-pages";
import type { UserOptions as PageLayoutPluginOptions } from "vite-plugin-vue-layouts";

import { APP_NAME } from "./constants";
import { Awaitable, createDebug } from "./helper";

const debug = createDebug("config");

type AutoImportPluginOptions = Parameters<typeof AutoImportPlugin>[0];

interface BuiltPlugins {
  vue: VuePluginOptions | false;
  vueJsx: VueJsxPluginOptions | false;
  pages: PagesPluginOptions | false;
  pageLayout: PageLayoutPluginOptions | false;
  unocss: UnocssPluginOptions | false;
  autoImport: AutoImportPluginOptions | false;
  vueComponents: VueComponentsOptions | false;
  visualizer: PluginVisualizerOptions | false;
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

interface HtmlOptions {
  title?: string;
  description?: string;
  head?: HeadConfig[];
  content?: string;
  inlinedScript?: string;
  transformHtml?: (content: string, config: DoainConfig) => Promise<string>;
}

export interface UserConfig {
  base?: string;
  root?: string;
  srcDir?: string;
  outDir?: string;
  cacheDir?: string;
  builtPlugins?: Partial<BuiltPlugins>;
  vite?: UserConfigExport;
  build?: BuildOptions;
  html?: HtmlOptions;
  buildEnd?: (config: DoainConfig) => Promise<void>;
}

export interface DoainClientConfig {
  builtPlugins: BuiltPlugins;
}

export interface RequiredUserConfig
  extends SetRequired<
    UserConfig,
    "base" | "root" | "srcDir" | "outDir" | "cacheDir" | "vite" | "build" | "html"
  > {
  builtPlugins: BuiltPlugins;
  buildEnd?: (config: DoainConfig) => Promise<void>;
}

export interface DoainConfig extends RequiredUserConfig {
  configPath: string | undefined;
  configDeps: string[];
}

type RawConfigExports = Awaitable<UserConfig> | (() => Awaitable<UserConfig>);

function resolveFromDoain(root: string, file: string) {
  return normalizePath(path.resolve(root, `.${APP_NAME}`, file));
}

const supportedConfigExtensions = ["js", "ts", "cjs", "mjs", "cts", "mts"];

/**
 * 读取`.doain/config.ext`的用户配置，以及该文件的依赖文件
 */
export async function resolveUserConfig(
  root: string,
  command: "serve" | "build" = "serve",
  mode = "development",
): Promise<[UserConfig, string | undefined, string[]]> {
  const configPath = supportedConfigExtensions
    .map((ext) => resolveFromDoain(root, `config.${ext}`))
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

/**
 * 设置UserConfig的默认值
 */
function mergeUserConfigWithDefaults(userConfig: UserConfig, root: string): RequiredUserConfig {
  const base = userConfig.base || "./";
  const srcDir = normalizePath(path.resolve(root, userConfig.srcDir || "."));
  const outDir = resolveFromDoain(root, userConfig.outDir || "dist");
  const cacheDir = resolveFromDoain(root, userConfig.cacheDir || "cache");

  const userBuiltPlugins = userConfig.builtPlugins || {};

  function mergeBuiltPluginOptions<N extends keyof BuiltPlugins>(
    name: N,
    defaults: Partial<BuiltPlugins[N]> = {},
  ): BuiltPlugins[N] {
    const pluginOptions = userBuiltPlugins[name];
    // 如果传入false，则表示禁用该插件
    if (pluginOptions === false) return false;
    return { ...defaults, ...(pluginOptions || {}) };
  }

  const builtPlugins: BuiltPlugins = {
    vue: mergeBuiltPluginOptions("vue", {}),
    vueJsx: mergeBuiltPluginOptions("vueJsx", {}),
    pages: mergeBuiltPluginOptions("pages", {
      dirs: "src/modules",
      extensions: ["vue", "tsx"],
      exclude: ["**/components/*.vue", "**/!(index).tsx"],
    }),
    pageLayout: mergeBuiltPluginOptions("pageLayout", {
      layoutsDirs: "src/layouts",
      defaultLayout: "default",
      extensions: ["vue", "tsx"],
    }),
    unocss: mergeBuiltPluginOptions("unocss", {}),
    autoImport: mergeBuiltPluginOptions("autoImport", {
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
      imports: ["vue", "@vueuse/core"],
    }),
    vueComponents: mergeBuiltPluginOptions("vueComponents", {
      dirs: ["src/components"],
      extensions: ["vue", "tsx"],
      resolvers: [ElementPlusResolver()],
    }),
    visualizer: mergeBuiltPluginOptions("visualizer", {}),
  };
  const viteOptions: UserConfigExport = {};
  const buildOptions: BuildOptions = {};
  const htmlOptions: HtmlOptions = {};

  return {
    root,
    base,
    srcDir,
    outDir,
    cacheDir,
    builtPlugins,
    vite: viteOptions,
    build: buildOptions,
    html: htmlOptions,
    buildEnd: userConfig.buildEnd,
  };
}

export async function resolveDoainConfig(root: string = process.cwd()): Promise<DoainConfig> {
  const [userConfig, configPath, configDeps] = await resolveUserConfig(root);
  const userConfigWithDefaults = mergeUserConfigWithDefaults(userConfig, root);

  return {
    ...userConfigWithDefaults,
    configPath,
    configDeps,
  };
}

export function defineConfig(config: UserConfig) {
  return config;
}
