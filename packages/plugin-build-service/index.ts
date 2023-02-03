// export const Plugin: (options?: ImportMapPluginOptions) => DoainPlugin = definePlugin(
//   (options: ImportMapPluginOptions = createDefaultImportMap()) => {
//     return {
//       name: "import-map",
//       command: "build",
//       html: {
//         head: [
//           // <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
//           [
//             "script",
//             {
//               async: true,
//               src: "https://unpkg.com/es-module-shims@1.5.18/dist/es-module-shims.wasm.js",
//             },
//           ],
//           ["script", { type: "importmap" }, JSON.stringify(options)],
//         ],
//       },
//       vite: {
//         build: {
//           rollupOptions: {
//             external: Object.keys(options.imports || {}),
//           },
//         },
//       },
//     };
//   },
// );
// export default Plugin;
import { DoainPlugin, definePlugin } from "doain/plugin";
// @ts-ignore ignore types
import ExternalPlugin from "rollup-plugin-external-globals";

// import { DoainPlugin, definePlugin } from "doain/plugin";
// export interface ImportMapPluginOptions {
//   imports?: Record<string, string>;
//   scopes?: Record<string, string>;
// }
type Heads = NonNullable<NonNullable<DoainPlugin["html"]>["head"]>;

type GlobalCDN = Record<
  string,
  {
    varName: string;
    js?: string;
    css?: string;
  }
>;

const defaultPkg = ["vue", "vue-router", "pinia", "element-plus"];
export const createDefaultImportMap = (pkgVersion?: Record<string, string | false>) => {
  const importMap: GlobalCDN = {};
  defaultPkg.forEach((name) => {
    // eslint-disable-next-line no-nested-ternary
    const version = pkgVersion ? (pkgVersion[name] === false ? false : pkgVersion[name]) : "latest";
    let jsUrl = "";
    let cssUrl = "";
    let varName = name;

    if (name === "vue") {
      // https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.min.js
      jsUrl = `https://fastly.jsdelivr.net/npm/vue@${version}/dist/vue.global.min.js`;
      varName = "Vue";
    }
    if (name === "vue-router") {
      jsUrl = `https://fastly.jsdelivr.net/npm/vue-router@${version}/dist/vue-router.global.min.js`;
      varName = "VueRouter";
    }
    if (name === "pinia") {
      jsUrl = `https://fastly.jsdelivr.net/npm/pinia@${version}/dist/pinia.iife.min.js`;
      varName = "Pinia";
    }
    if (name === "element-plus") {
      jsUrl = `https://fastly.jsdelivr.net/npm/element-plus@${version}/dist/index.full.min.mjs`;
      cssUrl = `https://fastly.jsdelivr.net/npm/element-plus@${version}/dist/index.css`;
      varName = "ElementPlus";
    }

    importMap[name] = {
      varName,
      js: jsUrl,
      css: cssUrl,
    };
  });
  return importMap;
};

const Plugin: () => DoainPlugin = definePlugin(
  (globalCdns: GlobalCDN = createDefaultImportMap()) => {
    const keys = Object.keys(globalCdns);
    const varNames = keys.reduce((acc, k) => {
      acc[k] = globalCdns[k].varName;
      return acc;
    }, {} as unknown as Record<string, string>);
    const tags: Heads = [];
    keys.forEach((k) => {
      const { js, css, varName } = globalCdns[k];

      if (js) {
        tags.push(["script", { src: js, dataName: varName }]);
      }
      if (css) {
        tags.push(["link", { rel: "stylesheet", href: css, dataName: varName }]);
      }
    });
    console.log(keys, globalCdns);

    return {
      name: "doain-build-service",
      command: "build",
      vite: {
        plugins: [
          {
            ...ExternalPlugin(varNames),
            enforce: "post",
            apply: "build",
          },
        ],
        build: {
          rollupOptions: {
            external: keys,
          },
        },
      },
      html: {
        head: tags,
      },
    };
  },
);

export default Plugin;
