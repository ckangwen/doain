import compression from "compression";
import polka from "polka";
import sirv, { RequestHandler } from "sirv";

import { resolveDoainConfig } from "../config/index";

function trimChar(str: string, char: string) {
  while (str.charAt(0) === char) {
    str = str.substring(1);
  }

  while (str.charAt(str.length - 1) === char) {
    str = str.substring(0, str.length - 1);
  }

  return str;
}

export interface ServeOptions {
  base?: string;
  port?: number;
}

export async function preview(root: string, options: ServeOptions = {}) {
  const port = options.port !== undefined ? options.port : 4173;
  const config = await resolveDoainConfig({ root });
  const configBase = config.base.replace("./", "");
  const base = trimChar(options?.base || configBase, "/");

  const notAnAsset = (pathname: string) => !pathname.includes("/assets/");

  const compress = compression() as RequestHandler;
  const serve = sirv(config.outDir, {
    etag: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res, pathname) {
      if (notAnAsset(pathname)) {
        res.setHeader("cache-control", "no-cache");
      }
    },
  });

  if (base) {
    return polka()
      .use(base, compress, serve)
      .listen(port, () => {
        console.log(`Built site served at http://localhost:${port}/${base}/\n`);
      });
  }
  return polka()
    .use(compress, serve)
    .listen(port, () => {
      console.log(`Built site served at http://localhost:${port}/\n`);
    });
}
