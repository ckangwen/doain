import { has, simpleDeepMerge } from "@charrue/toolkit";
import { init, parse } from "es-module-lexer";
import fg from "fast-glob";
import { readFileSync, writeFileSync } from "fs";
import MagicString from "magic-string";
import { resolve } from "path";
import c from "picocolors";
import type { OutputAsset, OutputChunk, RollupOutput } from "rollup";
import { createLogger, build as viteBuild } from "vite";
import type { UserConfig as ViteUserConfig } from "vite";

import { APP_INDEX_PATH } from "../alias";
import { ResolvedConfig, resolveDoainConfig } from "../config/index";
import { getEntryHtmlContent } from "../entryHtml";
import { GLOBAL_PACKAGE_VAR_NAME_MAP } from "../plugin/external-globals-plugin";
import { createDoainPlugin } from "../plugin/index";

export const failMark = "\x1b[31m✖\x1b[0m";
export const okMark = "\x1b[32m✓\x1b[0m";

export async function build(root: string, argv: any) {
  const config = await resolveDoainConfig({ root, command: "build" });
  const start = Date.now();

  console.log(c.cyan("start building..."));

  async function resolveViteBuildOptions(): Promise<ViteUserConfig> {
    return {
      root: config.srcDir,
      cacheDir: config.cacheDir,
      mode: argv.mode || "production",
      base: config.base,
      logLevel: "warn",
      plugins: [await createDoainPlugin({ config, command: "build" })].concat(
        config.vite?.plugins || [],
      ),
      clearScreen: true,
      build: simpleDeepMerge(
        {
          outDir: config.outDir,
          emptyOutDir: true,
          cssCodeSplit: false,
          rollupOptions: {
            input: {
              app: APP_INDEX_PATH,
            },
            output: {
              entryFileNames: "assets/[name].[hash].js",
              chunkFileNames: "assets/chunks/[name].[hash].js",
            },
          },
        },
        config.vite?.build || {},
      ),
    };
  }

  try {
    const buildResult = (await viteBuild(await resolveViteBuildOptions())) as RollupOutput;

    if (buildResult) {
      renderIndexPage(config, buildResult);
    }
  } catch (e: any) {
    createLogger("info").error(c.red(`error during build:\n${e.stack}`), {
      error: e,
    });
    process.exit(1);
  }

  await transformBuildResult(config);

  if (config.buildEnd) {
    await config.buildEnd(config);
  }

  console.log(c.green(`build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`));
}

const ESM_IMPORT_RE =
  /(^|;\s*|\r?\n+)import\s*((?:\*\s*as)?\s*([A-Za-z$_][\w$]*)?\s*,?\s*(?:{([\s\S]*?)})?)?\s*(from)?\s*(['"`][^'"`]+['"`])(?=;?)(?=([^"'`]*["'`][^"'`]*["'`])*[^"'`]*$)/g;

/**
 * 将esm模块转换为全局变量
 *
 * @example
 * import { ref } from "vue" => var ref = window["Vue"]["ref"]
 */
const transformBuildResult = async (config: ResolvedConfig) => {
  const files = fg.sync(["**/*.js"], {
    cwd: resolve(config.root, config.outDir),
  });
  await init;

  files.forEach((filename) => {
    const filepath = resolve(config.root, config.outDir, filename);
    const fileContent = readFileSync(filepath, "utf-8");
    const MS = new MagicString(fileContent);
    const [imports] = parse(fileContent);

    imports.forEach(({ d: dynamic, ss: statementStart, se: statementEnd, n: name }) => {
      // 排除import()动态引入
      if (dynamic === -1 && name) {
        const raw = fileContent.slice(statementStart, statementEnd);

        const matched = ESM_IMPORT_RE.exec(raw);
        const moduleName = matched?.[6];
        const importVars = matched?.[4];
        // 不是 import {} from "xxx" 的形式
        if (!moduleName || !importVars) {
          // eg: import "vue" => ""
          if (!(name.startsWith("./") || name.startsWith("../"))) {
            MS.overwrite(statementStart, statementEnd, "");
          }
          return;
        }

        console.log(c.cyan(`start transform  ${filename}.`));

        if (!has(GLOBAL_PACKAGE_VAR_NAME_MAP, name)) {
          console.log(c.red(`package "${c.bold(name)}" is not in global package list !`));
        }

        const transformed = importVars
          ?.split(",")
          ?.map((s) => {
            if (s.indexOf(" as ") !== -1) {
              return s.split(" as ")[1].trim();
            }
            return s.trim();
          })
          ?.map((varName) => {
            return `var ${varName} = window["${GLOBAL_PACKAGE_VAR_NAME_MAP[name]}"]["${varName}"];`;
          })
          ?.join("\n");

        if (transformed) {
          MS.overwrite(statementStart, statementEnd, transformed);
        }
      }
    });

    writeFileSync(filepath, MS.toString(), "utf-8");
  });

  console.log(c.green(`transform complete.`));
};

async function renderIndexPage(config: ResolvedConfig, buildOutput: RollupOutput) {
  console.log(c.cyan(`start render index.html.`));

  const appChunk = buildOutput.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry && chunk.facadeModuleId?.endsWith(".js"),
  ) as OutputChunk;

  const cssChunk = buildOutput.output.find(
    (chunk) => chunk.type === "asset" && chunk.fileName.endsWith(".css"),
  ) as OutputAsset;
  const stylesheetLink = cssChunk?.fileName
    ? `<link rel="preload stylesheet" href="${config.base}${cssChunk.fileName}" as="style">`
    : "";

  let htmlContent = await getEntryHtmlContent(config, {
    head: stylesheetLink,
    script: `${
      appChunk
        ? `<script type="module" async src="${config.base}${appChunk.fileName}"></script>`
        : ``
    }`,
  });

  const htmlFilePath = resolve(config.outDir, "index.html");
  const htmlTransform = config.html.transformHtml;
  if (htmlTransform) {
    const transformedContent = await htmlTransform?.(htmlContent, config);
    htmlContent = transformedContent || htmlContent;
  }

  writeFileSync(htmlFilePath, htmlContent, "utf-8");
}
