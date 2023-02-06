import { readPackageJson } from "@charrue/node-toolkit";
import { Dict } from "@charrue/types";
import { resolve } from "path";
// @ts-ignore ignore types
import ExternalPlugin from "rollup-plugin-external-globals";

import { currentDir } from "../helper";
import { DoainPlugin } from "./doain-plugin";

type Heads = NonNullable<NonNullable<DoainPlugin["html"]>["head"]>;

type GlobalCDNConfig = Record<
  string,
  {
    varName: string;
    js?: string;
    css?: string;
  }
>;

// 需要注意顺序，需要先引入vue，ep
export const GLOBAL_PACKAGE_NAMES = [
  "vue",
  "element-plus",
  "vue-router",
  "@charrue/layout-next",
  "@charrue/schema-form-next",
  "@charrue/schema-table-next",
  "pinia",
];
export const GLOBAL_PACKAGE_VAR_NAME_MAP: Record<string, string> = {
  "@charrue/layout-next": "CHARRUE_LAYOUT",
  "@charrue/schema-form-next": "CHARRUE_SCHEMA_FORM",
  "@charrue/schema-table-next": "CHARRUE_SCHEMA_TABLE",
  vue: "Vue",
  "vue-router": "VueRouter",
  pinia: "Pinia",
  "element-plus": "ElementPlus",
};

const createCdnConfig = (pkgVersions: Dict): GlobalCDNConfig => {
  const getVersion = (name: string) => {
    return pkgVersions[name] || "latest";
  };
  return {
    "@charrue/schema-table-next": {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP["@charrue/schema-table-next"],
      js: `https://fastly.jsdelivr.net/npm/@charrue/schema-table-next@${getVersion(
        "@charrue/schema-table-next",
      )}/dist/index.full.js`,
      css: `https://fastly.jsdelivr.net/npm/@charrue/schema-table-next@${getVersion(
        "@charrue/schema-table-next",
      )}/index.css`,
    },
    "@charrue/schema-form-next": {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP["@charrue/schema-form-next"],
      js: `https://fastly.jsdelivr.net/npm/@charrue/schema-form-next@${getVersion(
        "@charrue/schema-form-next",
      )}/dist/index.full.js`,
      css: `https://fastly.jsdelivr.net/npm/@charrue/schema-form-next@${getVersion(
        "@charrue/schema-form-next",
      )}/index.css`,
    },
    "@charrue/layout-next": {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP["@charrue/layout-next"],
      js: `https://fastly.jsdelivr.net/npm/@charrue/layout-next@${getVersion(
        "@charrue/layout-next",
      )}/dist/index.full.js`,
      css: `https://fastly.jsdelivr.net/npm/@charrue/layout-next@${getVersion(
        "@charrue/layout-next",
      )}/index.css`,
    },
    vue: {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP.vue,
      js: `https://fastly.jsdelivr.net/npm/vue@${getVersion("vue")}/dist/vue.global.min.js`,
    },
    "vue-router": {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP["vue-router"],
      js: `https://fastly.jsdelivr.net/npm/vue-router@${getVersion(
        "vue-router",
      )}/dist/vue-router.global.min.js`,
    },
    pinia: {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP.pinia,
      js: `https://fastly.jsdelivr.net/npm/pinia@${getVersion("pinia")}/dist/pinia.iife.min.js`,
    },
    "element-plus": {
      varName: GLOBAL_PACKAGE_VAR_NAME_MAP["element-plus"],
      js: `https://fastly.jsdelivr.net/npm/element-plus@${getVersion(
        "element-plus",
      )}/dist/index.full.min.js`,
      css: `https://fastly.jsdelivr.net/npm/element-plus@${getVersion(
        "element-plus",
      )}/dist/index.css`,
    },
  };
};

export const createExternalDoainPlugin = (root: string): DoainPlugin => {
  const clientPackageJson = readPackageJson(resolve(currentDir, "../../client")) || {};
  const rootPackageJson = readPackageJson(root) || {};
  const getVersion = (name: string) => {
    let version =
      rootPackageJson.dependencies?.[name] ||
      rootPackageJson.devDependencies?.[name] ||
      clientPackageJson.dependencies?.[name] ||
      clientPackageJson.devDependencies?.[name];
    version = version ? `${version}` : "";
    version = version.replace(/[\^~]/, "");
    return version || "latest";
  };

  const pkgVersions = GLOBAL_PACKAGE_NAMES.reduce((acc, name) => {
    acc[name] = getVersion(name);
    return acc;
  }, {} as unknown as Dict);

  const cdnConfig = createCdnConfig(pkgVersions);
  const ExternalVitePlugin = {
    ...ExternalPlugin(GLOBAL_PACKAGE_VAR_NAME_MAP),
    enforce: "post",
    apply: "build",
  };
  const headTags: Heads = [];
  GLOBAL_PACKAGE_NAMES.forEach((name) => {
    const { js, css, varName } = cdnConfig[name];

    // pinia 依赖 vue-demi，但是不需要引入vue-demi的js,直接将Vue赋值给VueDemi
    // 这个script需要放在在pinia的js的前面
    if (name === "pinia") {
      headTags.push([
        "script",
        {
          dataName: "vue-demi",
        },
        "var VueDemi = Vue;",
      ]);
    }

    if (js) {
      headTags.push(["script", { src: js, dataName: varName }]);
    }
    if (css) {
      headTags.push(["link", { rel: "stylesheet", href: css, dataName: varName }]);
    }
  });

  return {
    name: "doain:external-globals-plugin",
    command: "build",
    vite: {
      plugins: [ExternalVitePlugin],
      build: {
        rollupOptions: {
          external: GLOBAL_PACKAGE_NAMES,
        },
      },
    },
    html: {
      head: headTags,
    },
  };
};
