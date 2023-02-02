import Pages from "@charrue/vite-plugin-pages";
import { definePageRoutePlugin, resolveRouteBlock } from "@charrue/vite-plugin-pages-extend";
import PageLayout from "@charrue/vite-plugin-vue-layouts";
import vueJsxPlugin from "@vitejs/plugin-vue-jsx";
import { relative } from "path";
import c from "picocolors";
import _VisualizerPlugin from "rollup-plugin-visualizer";
import UnocssPlugin from "unocss/vite";
import AutoImportPlugin from "unplugin-auto-import/vite";
import VueComponentsPlugin from "unplugin-vue-components/vite";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import type { PluginOption } from "vite";

import {
  APP_INDEX_PATH,
  DIST_CLIENT_PATH,
  createClientAlias,
  getUserClientConfigPath,
  getUserRegisterAppPath,
} from "../alias";
import type { Command, ResolvedConfig } from "../config/index";
import { getEntryHtmlContent } from "../entryHtml";
import { cleanUrl } from "../helper";

const VisualizerPlugin = (_VisualizerPlugin as any).default || _VisualizerPlugin;

const DoainNodePlugin = (options: {
  config: ResolvedConfig;
  recreateServer?: () => Promise<void>;
  command?: Command;
}): PluginOption => {
  const { config, recreateServer } = options;
  const { configPath, configDeps, vite: userViteConfig, root } = config;

  const userConfigFiles = [getUserClientConfigPath(root), getUserRegisterAppPath(root)];

  return {
    name: "doain-node-plugin",

    // 合并一些默认的配置
    config() {
      const baseConfig = defineViteConfig({
        // 针对于@doain/client的配置
        resolve: {
          alias: createClientAlias(config),
        },
        optimizeDeps: {
          entries: [APP_INDEX_PATH, ...userConfigFiles],
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

      // 监听用户自定义的配置文件
      userConfigFiles.forEach((filepath) => {
        if (filepath && !filepath.startsWith(DIST_CLIENT_PATH)) {
          server.watcher.add(filepath);
        }
      });

      // 在内部中间件安装后执行
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url && cleanUrl(req.url);

          if (url?.endsWith(".html")) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            let html = await getEntryHtmlContent(config, {
              script: `<script type="module" src="/@fs/${APP_INDEX_PATH}"></script>`,
            });
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
};

// eslint-disable-next-line max-statements
export async function createDoainPlugin(options: {
  config: ResolvedConfig;
  recreateServer?: () => Promise<void>;
  command?: Command;
}): Promise<PluginOption> {
  const { config, recreateServer, command } = options;
  const { vue, vueJsx, pages, pageLayout, unocss, autoImport, vueComponents, visualizer } =
    config.builtPlugins || {};

  const plugins: PluginOption[] = [];

  if (vue) {
    // lazy require plugin-vue to respect NODE_ENV in @vue/compiler-x
    const vuePlugin = await import("@vitejs/plugin-vue").then((r) => r.default(vue));
    plugins.push(vuePlugin);
  }
  if (vueJsx !== false) {
    plugins.push(vueJsxPlugin(vueJsx));
  }
  if (pages !== false) {
    plugins.push(
      Pages({
        ...pages,
        resolveRouteBlock,
      }),
    );
    plugins.push(definePageRoutePlugin());
  }
  if (pageLayout !== false) {
    plugins.push(PageLayout(pageLayout));
  }
  if (unocss !== false) {
    plugins.push(UnocssPlugin(unocss));
  }
  if (autoImport !== false) {
    plugins.push(AutoImportPlugin(autoImport));
  }
  if (vueComponents !== false) {
    plugins.push(VueComponentsPlugin(vueComponents));
  }
  if (visualizer !== false) {
    plugins.push(VisualizerPlugin(visualizer));
  }

  plugins.push(
    DoainNodePlugin({
      config,
      recreateServer,
      command,
    }),
  );

  return plugins;
}
