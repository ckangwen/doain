import type { SetRequired } from "@charrue/types";
import type { UserOptions as PagesPluginOptions } from "@charrue/vite-plugin-pages";
import type { UserOptions as PageLayoutPluginOptions } from "@charrue/vite-plugin-vue-layouts";
import type { VitePluginConfig as UnocssPluginOptions } from "@unocss/vite";
import type { Options as VuePluginOptions } from "@vitejs/plugin-vue";
import type { Options as VueJsxPluginOptions } from "@vitejs/plugin-vue-jsx";
import type { PluginVisualizerOptions } from "rollup-plugin-visualizer";
import AutoImportPlugin from "unplugin-auto-import/vite";
import type { Options as VueComponentsOptions } from "unplugin-vue-components";
import { UserConfig as ViteConfig } from "vite";
import type { BuildOptions } from "vite";

import { DoainPlugin } from "../plugin/doain-plugin";

export type Command = "dev" | "build" | "preview";

type AutoImportPluginOptions = Parameters<typeof AutoImportPlugin>[0];

export interface BuiltPlugins {
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
  | [string, Record<string, string | true>]
  | [string, Record<string, string | true>, string];

export interface HtmlOptions {
  title?: string;
  description?: string;
  head?: HeadConfig[];
  content?: string;
  inlinedScript?: string;
  transformHtml?: (content: string, config: ResolvedConfig) => Promise<string>;
}
export interface UserConfig {
  base?: string;
  root?: string;
  srcDir?: string;
  outDir?: string;
  cacheDir?: string;
  builtPlugins?: Partial<BuiltPlugins>;
  vite?: ViteConfig;
  build?: BuildOptions;
  html?: HtmlOptions;
  buildEnd?: (config: ResolvedConfig) => Promise<void>;
  plugins?: DoainPlugin[];
}

export interface RequiredUserConfig
  extends SetRequired<
    Omit<UserConfig, "plugins">,
    "base" | "root" | "srcDir" | "outDir" | "cacheDir" | "vite" | "build" | "html"
  > {
  builtPlugins: BuiltPlugins;
  buildEnd?: (config: ResolvedConfig) => Promise<void>;
}

export interface ResolvedConfig extends RequiredUserConfig {
  configPath: string | undefined;
  configDeps: string[];
}
