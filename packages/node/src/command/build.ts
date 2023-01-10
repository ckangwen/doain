// import ora from "ora";
import { writeFileSync } from "fs";
import { resolve } from "path";
import c from "picocolors";
import type { OutputAsset, OutputChunk, RollupOutput } from "rollup";
import { createLogger, build as viteBuild } from "vite";
import type { UserConfig as ViteUserConfig } from "vite";

import { APP_INDEX_PATH } from "../alias";
import { DoainConfig, resolveDoainConfig } from "../config";
import { createDoainPlugin } from "../plugins";

export const failMark = "\x1b[31m✖\x1b[0m";
export const okMark = "\x1b[32m✓\x1b[0m";

export async function build(root: string, argv: any) {
  const config = await resolveDoainConfig(root);
  const logLevel = "info";

  console.log(c.cyan("start building..."));

  async function resolveViteBuildOptions(): Promise<ViteUserConfig> {
    return {
      root: config.srcDir,
      cacheDir: config.cacheDir,
      mode: argv.mode || "production",
      base: config.base,
      logLevel: "warn",
      plugins: [await createDoainPlugin(config)],
      clearScreen: true,
      build: {
        outDir: config.outDir,
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
          input: {
            app: APP_INDEX_PATH,
          },
        },
      },
    };
  }

  try {
    const buildResult = (await viteBuild(await resolveViteBuildOptions())) as RollupOutput;

    if (buildResult) {
      const appChunk = buildResult.output.find(
        (chunk) => chunk.type === "chunk" && chunk.isEntry && chunk.facadeModuleId?.endsWith(".js"),
      ) as OutputChunk;

      const cssChunk = buildResult.output.find(
        (chunk) => chunk.type === "asset" && chunk.fileName.endsWith(".css"),
      ) as OutputAsset;

      renderIndexPage(config, appChunk, cssChunk);
    }
  } catch (e: any) {
    createLogger(logLevel).error(c.red(`error during build:\n${e.stack}`), {
      error: e,
    });
    process.exit(1);
  }

  console.log(c.green("building finished!"));
}

function renderIndexPage(config: DoainConfig, appChunk: OutputChunk, cssChunk: OutputAsset) {
  function getHtmlContent(options: {
    lang?: string;
    preloadLinksString?: string;
    prefetchLinkString?: string;
    content?: string;
    inlinedScript?: string;
    head?: string;
  }) {
    const {
      lang = "",
      head,
      preloadLinksString = "",
      prefetchLinkString = "",
      content = "",
      inlinedScript = "",
    } = options;

    const stylesheetLink = cssChunk
      ? `<link rel="preload stylesheet" href="${config.base}${cssChunk.fileName}" as="style">`
      : "";

    return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${config.html.title}</title>
        <meta name="description" content="${config.html.description}">
        ${stylesheetLink}
        ${preloadLinksString}
        ${prefetchLinkString}
        ${head}
      </head>
      <body>
        <div id="app">${content}</div>
        ${
          appChunk
            ? `<script type="module" async src="${config.base}${appChunk.fileName}"></script>`
            : ``
        }
        ${inlinedScript}
      </body>
    </html>`.trim();
  }

  const htmlFilePath = resolve(config.outDir, "index.html");
  // transformHtml

  writeFileSync(htmlFilePath, getHtmlContent({}), "utf-8");
}
