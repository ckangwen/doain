/* eslint-disable max-statements */
import vueJsxPlugin from "@vitejs/plugin-vue-jsx";
import { relative } from "path";
import c from "picocolors";
import _VisualizerPlugin from "rollup-plugin-visualizer";
import UnocssPlugin from "unocss/vite";
import AutoImportPlugin from "unplugin-auto-import/vite";
import VueComponentsPlugin from "unplugin-vue-components/vite";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import type { PluginOption } from "vite";
import Pages from "vite-plugin-pages";
import PageLayout from "vite-plugin-vue-layouts";

import { APP_INDEX_PATH, createClientAlias } from "./alias";
import type { DoainConfig } from "./config";
import { cleanUrl } from "./helper";

const VisualizerPlugin = (_VisualizerPlugin as any).default || _VisualizerPlugin;

export async function createDoainPlugin(
  config: DoainConfig,
  recreateServer?: () => Promise<void>,
): Promise<PluginOption> {
  const { vue, vueJsx, pages, pageLayout, unocss, autoImport, vueComponents, visualizer } =
    config.builtPlugins || {};

  const plugins: PluginOption[] = [];

  if (vue) {
    // lazy require plugin-vue to respect NODE_ENV in @vue/compiler-x
    const vuePlugin = await import("@vitejs/plugin-vue").then((r) => r.default(vue));
    plugins.push(vuePlugin);
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
  const { configPath, configDeps, vite: userViteConfig } = config;
  return {
    name: "doain",

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
