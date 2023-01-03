import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { visualizer } from "rollup-plugin-visualizer";
import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import Inspect from "vite-plugin-inspect";
import Pages from "vite-plugin-pages";
import PageLayout from "vite-plugin-vue-layouts";

const plugins = [
  vue(),
  vueJsx(),
  Inspect(),
  Pages({
    dirs: "src/modules",
    extensions: ["vue", "tsx"],
    exclude: ["**/components/*.vue", "**/!(index).tsx"],
  }),
  PageLayout({
    layoutsDirs: "src/layouts",
    extensions: ["vue", "tsx"],
  }),
  Unocss(),
  AutoImport({
    imports: ["vue", "vue-router", "@vueuse/core"],
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    dirs: ["src/components"],
    extensions: ["vue", "tsx"],
    resolvers: [ElementPlusResolver()],
  }),
  visualizer(),
];

export default plugins;
