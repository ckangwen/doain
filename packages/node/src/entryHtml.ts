import escape from "escape-html";
import { transformWithEsbuild } from "vite";

import { HeadConfig, ResolvedConfig } from "./config/types";

function renderHead(head: HeadConfig[] = []): Promise<string> {
  return Promise.all(
    head.map(async ([tag, attrs = {}, innerHTML = ""]) => {
      const openTag = `<${tag}${renderAttrs(attrs)}>`;
      if (tag !== "link" && tag !== "meta") {
        if (
          tag === "script" &&
          (attrs.type === undefined || `${attrs.type}`.includes("javascript"))
        ) {
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

function renderAttrs(attrs: Record<string, string | true>): string {
  return Object.keys(attrs)
    .map((key) => {
      const value = attrs[key];
      if (value && value === true) {
        return ` ${key}`;
      }
      return ` ${key}="${escape(`${attrs[key]}`)}"`;
    })
    .join("");
}

export const getEntryHtmlContent = async (
  config: ResolvedConfig,
  options: {
    head?: string;
    script?: string;
  },
) => {
  const heads = config.html.head || [];
  const headContents = (heads.length ? await renderHead(heads) : "") + (options.head || "");
  const scriptContents = (config.html.inlinedScript || "") + (options.script || "");

  return `<!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <title>${config.html.title || ""}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="description" content="${config.html.description || ""}">
      ${headContents}
    </head>
    <body>
      <div id="app">${config.html.content || ""}</div>
      ${scriptContents}
    </body>
  </html>`.trim();
};
