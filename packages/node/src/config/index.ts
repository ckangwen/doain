import { isObj, simpleDeepMerge } from "@charrue/toolkit";
import { Awaitable } from "@charrue/types";
import { existsSync } from "fs";
import { resolve } from "path";
import { OutputPlugin } from "rollup";
import {
  BuildOptions,
  PluginOption,
  UserConfigExport,
  loadConfigFromFile,
  mergeConfig as mergeViteConfig,
  normalizePath,
} from "vite";

import { createExternalDoainPlugin } from "../plugin/external-globals-plugin";
import {
  defaultAutoImportOptions,
  defaultIconOptions,
  defaultUnocssOptions,
  defaultVisualizerOptions,
  defaultVueComponentsOptions,
  defaultVueJsxOptions,
  defaultVueOptions,
  defaultVuePageLayoutOptions,
  defaultVuePagesOptions,
} from "../plugin/vite-plugin";
import { BuiltPlugins, Command, HtmlOptions, ResolvedConfig, UserConfig } from "./types";

export const mergeDefaultConfig = (userConfig: UserConfig, root: string): ResolvedConfig => {
  let { srcDir = ".", outDir = "dist", cacheDir = "cache" } = userConfig;
  const { base = "./", builtPlugins: userBuiltPlugins = {} } = userConfig;

  srcDir = normalizePath(resolve(root, srcDir));
  outDir = normalizePath(resolve(root, outDir));
  cacheDir = normalizePath(resolve(root, cacheDir));

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
    vue: mergeBuiltPluginOptions("vue", defaultVueOptions),
    vueJsx: mergeBuiltPluginOptions("vueJsx", defaultVueJsxOptions),
    pages: mergeBuiltPluginOptions("pages", defaultVuePagesOptions),
    pageLayout: mergeBuiltPluginOptions("pageLayout", defaultVuePageLayoutOptions),
    unocss: mergeBuiltPluginOptions("unocss", defaultUnocssOptions),
    autoImport: mergeBuiltPluginOptions("autoImport", defaultAutoImportOptions),
    vueComponents: mergeBuiltPluginOptions("vueComponents", defaultVueComponentsOptions),
    visualizer: mergeBuiltPluginOptions("visualizer", defaultVisualizerOptions),
    icons: mergeBuiltPluginOptions("icons", defaultIconOptions),
  };
  const viteOptions: UserConfigExport = userConfig.vite || {};
  const buildOptions: BuildOptions = userConfig.build || {};
  const htmlOptions = userConfig.html || {};

  return {
    root,
    base,
    srcDir,
    outDir,
    cacheDir,
    builtPlugins,
    vite: viteOptions,
    build: buildOptions,
    html: htmlOptions as HtmlOptions,
    buildEnd: userConfig.buildEnd,
    configDeps: [],
    configPath: "",
  };
};

const mergeConfig = <T extends UserConfig>(source: T, target: UserConfig): ResolvedConfig => {
  const result = simpleDeepMerge(source, target) as ResolvedConfig;
  result.vite = mergeViteConfig(source.vite || {}, target.vite || {});

  const plugins: PluginOption[] = [];

  const existPluginNames: string[] = [];
  result.vite.plugins?.forEach((plugin) => {
    if (isObj(plugin) && plugin.name) {
      if (!existPluginNames.includes((plugin as OutputPlugin).name)) {
        existPluginNames.push((plugin as OutputPlugin).name);
        plugins.push(plugin);
      }
    } else {
      plugins.push(plugin);
    }
  });

  result.vite.plugins = plugins;

  return result;
};

const supportedConfigExtensions = ["js", "ts", "cjs", "mjs", "cts", "mts"];

type AwaitableUserConfig = Awaitable<UserConfig> | (() => Awaitable<UserConfig>);

/**
 * 读取用户配置，以及该文件的依赖文件
 */
const resolveUserConfig = async (
  root: string,
  command: Command,
  mode = "development",
): Promise<[UserConfig, string | undefined, string[]]> => {
  const configPath = supportedConfigExtensions
    .map((ext) => normalizePath(resolve(root, `.doainrc.${ext}`)))
    .find(existsSync);

  let userConfig: AwaitableUserConfig = {};
  let configDeps: string[] = [];
  if (!configPath) {
    //
  } else {
    const configExports = await loadConfigFromFile(
      { command: command === "build" ? "build" : "serve", mode },
      configPath,
      root,
    );
    if (configExports) {
      userConfig = configExports.config as AwaitableUserConfig;
      configDeps = configExports.dependencies.map((file) => normalizePath(resolve(file)));
    }
  }

  return [
    await (typeof userConfig === "function" ? userConfig() : userConfig),
    configPath,
    configDeps,
  ];
};

export const resolveDoainConfig = async (options: {
  root: string;
  command?: Command;
}): Promise<ResolvedConfig> => {
  const { root, command = "dev" } = options;
  const [userConfig, configPath, configDeps] = await resolveUserConfig(root, command);
  let userConfigWithDefaults = mergeDefaultConfig(userConfig, root);
  const doainPlugins = userConfig.plugins
    ? userConfig.plugins.concat([createExternalDoainPlugin(root)])
    : [createExternalDoainPlugin(root)];
  const plugins =
    doainPlugins.filter((item) => {
      return item.command === command || !item.command;
    }) || [];
  let pluginConfig: UserConfig = {};
  plugins?.forEach((item) => {
    pluginConfig = mergeConfig(pluginConfig, item);
  });
  userConfigWithDefaults = mergeConfig(userConfigWithDefaults, pluginConfig);

  return {
    ...userConfigWithDefaults,
    configPath,
    configDeps,
  };
};

export const defineConfig = (config: UserConfig) => {
  return config;
};

export * from "./types";
