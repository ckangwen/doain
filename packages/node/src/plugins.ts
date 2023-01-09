/* eslint-disable max-statements */
import vuePlugin from "@vitejs/plugin-vue";
import vueJsxPlugin from "@vitejs/plugin-vue-jsx";
import { relative } from "path";
import c from "picocolors";
import VisualizerPlugin from "rollup-plugin-visualizer";
import UnocssPlugin from "unocss/vite";
import AutoImportPlugin from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import VueComponentsPlugin from "unplugin-vue-components/vite";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import type { PluginOption } from "vite";
import Pages from "vite-plugin-pages";
import PageLayout from "vite-plugin-vue-layouts";

import { APP_INDEX_PATH, createClientAlias } from "./alias";
import type { DoainConfig } from "./config";
import { MODULE_ID, MODULE_ID_VIRTUAL } from "./constants";
import { cleanUrl } from "./helper";

type BuiltPluginName = keyof NonNullable<DoainConfig["builtPlugins"]>;
type BuiltPluginOption<T extends BuiltPluginName> = NonNullable<
  NonNullable<DoainConfig["builtPlugins"]>[T]
>;
const vueOptions: BuiltPluginOption<"vue"> = {};
const vueJsxOptions: BuiltPluginOption<"vueJsx"> = {};
const pagesOptions: BuiltPluginOption<"pages"> = {
  dirs: "src/modules",
  extensions: ["vue", "tsx"],
  exclude: ["**/components/*.vue", "**/!(index).tsx"],
};
const vueLayoutOptions: BuiltPluginOption<"pageLayout"> = {
  layoutsDirs: "src/layouts",
  defaultLayout: "default",
  extensions: ["vue", "tsx"],
};
const unocssOptions: BuiltPluginOption<"unocss"> = {};
const autoImportOptions: BuiltPluginOption<"autoImport"> = {};
const vueComponentsOptions: BuiltPluginOption<"vueComponents"> = {
  dirs: ["src/components"],
  extensions: ["vue", "tsx"],
  resolvers: [ElementPlusResolver()],
};
const visualizerOptions: NonNullable<DoainConfig["builtPlugins"]>["visualizer"] = {};

export function createDoainPlugin(
  config: DoainConfig,
  recreateServer?: () => Promise<void>,
): PluginOption {
  const {
    vue = vueOptions,
    vueJsx = vueJsxOptions,
    pages = pagesOptions,
    pageLayout = vueLayoutOptions,
    unocss = unocssOptions,
    autoImport = autoImportOptions,
    vueComponents = vueComponentsOptions,
    visualizer = visualizerOptions,
  } = config.builtPlugins || {};

  const plugins: PluginOption[] = [];

  // lazy require plugin-vue to respect NODE_ENV in @vue/compiler-x
  // const vuePlugin = await import('@vitejs/plugin-vue').then((r) =>
  //   r.default({
  //     include: [/\.vue$/, /\.md$/],
  //     ...userVuePluginOptions
  //   })
  // )

  if (vue) {
    plugins.push(vuePlugin(vue));
  }
  if (vueJsx) {
    plugins.push(vueJsxPlugin(vueJsx));
  }
  if (pages) {
    plugins.push(Pages(pages));
  }
  if (pageLayout) {
    plugins.push(PageLayout(pageLayout));
  }
  if (unocss) {
    plugins.push(UnocssPlugin(unocss));
  }
  if (unocss) {
    plugins.push(UnocssPlugin(unocss));
  }
  if (autoImport) {
    plugins.push(AutoImportPlugin(autoImport));
  }
  if (vueComponents) {
    plugins.push(VueComponentsPlugin(vueComponents));
  }
  if (visualizer) {
    plugins.push(VisualizerPlugin(visualizer));
  }

  plugins.push(doainPlugin(config, recreateServer));

  return plugins;
}

function doainPlugin(config: DoainConfig, recreateServer?: () => Promise<void>): PluginOption {
  const { configPath, configDeps, vite: userViteConfig, clientConfig } = config;
  return {
    name: "doain",

    /**
     * 可以自定义第三方依赖的解析
     * https://rollupjs.org/guide/en/#resolveid
     */
    resolveId(importee) {
      if (importee === MODULE_ID) {
        return MODULE_ID_VIRTUAL;
      }
      return null;
    },
    /**
     * 在resolveId之后执行
     * 定义了一个自定义的加载器
     * https://rollupjs.org/guide/en/#load
     */
    load(id) {
      if (id === MODULE_ID_VIRTUAL) {
        return `export default JSON.parse(${JSON.stringify(JSON.stringify(clientConfig))})`;
      }
      return null;
    },
    // 合并一些默认的配置
    config() {
      const baseConfig = defineViteConfig({
        resolve: {
          alias: createClientAlias(config),
        },
      });

      return userViteConfig ? mergeConfig(userViteConfig, baseConfig) : baseConfig;
    },

    configureServer(server) {
      // 监听配置文件及其依赖的变化，以便于更新
      if (configPath) {
        server.watcher.add(configPath);
        configDeps.forEach((file) => {
          server.watcher.add(file);
        });
      }

      // 在内部中间件安装后执行
      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url && cleanUrl(req.url);

          if (url?.endsWith(".html")) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            let html = `<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_INDEX_PATH}"></script>
  </body>
</html>`;
            html = await server.transformIndexHtml(url, html, req.originalUrl);
            res.end(html);
            return;
          }

          next();
        });
      };
    },

    async handleHotUpdate(ctx) {
      const { file } = ctx;
      if (file === configPath || configDeps.includes(file)) {
        console.log(c.green(`\n${relative(process.cwd(), file)} changed, restarting server...`));
        try {
          // clearCache()
          await recreateServer?.();
        } catch (err) {
          console.error(c.red(`failed to restart server. error:\n`), err);
        }
      }
    },
  };
}
