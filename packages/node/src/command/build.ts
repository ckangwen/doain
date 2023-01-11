// import ora from "ora";
import escape from "escape-html";
import { writeFileSync } from "fs";
import { resolve } from "path";
import c from "picocolors";
import type { OutputAsset, OutputChunk, RollupOutput } from "rollup";
import { createLogger, transformWithEsbuild, build as viteBuild } from "vite";
import type { UserConfig as ViteUserConfig } from "vite";

import { APP_INDEX_PATH } from "../alias";
import { DoainConfig, HeadConfig, resolveDoainConfig } from "../config";
import { createDoainPlugin } from "../plugins";

export const failMark = "\x1b[31m✖\x1b[0m";
export const okMark = "\x1b[32m✓\x1b[0m";

export async function build(root: string, argv: any) {
  const config = await resolveDoainConfig(root);
  const start = Date.now();
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

  if (config.buildEnd) {
    await config.buildEnd(config);
  }

  console.log(`build complete in ${((Date.now() - start) / 1000).toFixed(2)}s.`);
}

async function renderIndexPage(config: DoainConfig, appChunk: OutputChunk, cssChunk: OutputAsset) {
  const stylesheetLink = cssChunk?.fileName
    ? `<link rel="preload stylesheet" href="${config.base}${cssChunk.fileName}" as="style">`
    : "";

  const head = config.html.head ? await renderHead(config.html.head) : "";

  let htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${config.html.title || ""}</title>
        <meta name="description" content="${config.html.description || ""}">
        ${stylesheetLink}
        ${head}
      </head>
      <body>
        <div id="app">${config.html.content || ""}</div>
        ${
          appChunk
            ? `<script type="module" async src="${config.base}${appChunk.fileName}"></script>`
            : ``
        }
        ${config.html.inlinedScript || ""}
      </body>
    </html>`.trim();

  const htmlFilePath = resolve(config.outDir, "index.html");
  if (config.html.transformHtml) {
    htmlContent = await config.html.transformHtml(htmlContent, config);
  }

  writeFileSync(htmlFilePath, htmlContent, "utf-8");
}

function renderHead(head: HeadConfig[]): Promise<string> {
  return Promise.all(
    head.map(async ([tag, attrs = {}, innerHTML = ""]) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`;
      if (tag !== "link" && tag !== "meta") {
        if (tag === "script" && (attrs.type === undefined || attrs.type.includes("javascript"))) {
          innerHTML = (
            await transformWithEsbuild(innerHTML, "inline-script.js", {
              minify: true,
            })
          ).code.trim();
        }
        return `${openTag}${innerHTML}</${tag}>`;
      }
      return openTag;
    }),
  ).then((tags) => tags.join("\n  "));
}

function renderAttrs(attrs: Record<string, string>): string {
  return Object.keys(attrs)
    .map((key) => {
      return ` ${key}="${escape(attrs[key])}"`;
    })
    .join("");
}
