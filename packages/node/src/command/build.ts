import { writeFileSync } from "fs";
import { resolve } from "path";
import c from "picocolors";
import type { OutputAsset, OutputChunk, RollupOutput } from "rollup";
import { createLogger, build as viteBuild } from "vite";
import type { UserConfig as ViteUserConfig } from "vite";

import { APP_INDEX_PATH } from "../alias";
import { ResolvedConfig, resolveDoainConfig } from "../config/index";
import { getEntryHtmlContent } from "../entryHtml";
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
      plugins: [await createDoainPlugin({ config, command: "build" })],
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
    createLogger("info").error(c.red(`error during build:\n${e.stack}`), {
      error: e,
    });
    process.exit(1);
  }

  if (config.buildEnd) {
    await config.buildEnd(config);
  }

  console.log(`build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`);
}

async function renderIndexPage(
  config: ResolvedConfig,
  appChunk: OutputChunk,
  cssChunk: OutputAsset,
) {
  const stylesheetLink = cssChunk?.fileName
    ? `<link rel="preload stylesheet" href="${config.base}${cssChunk.fileName}" as="style">`
    : "";

  let htmlContent = await getEntryHtmlContent(config, {
    head: stylesheetLink,
    script: `        ${
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
