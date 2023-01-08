import dns from "dns";
import { ServerOptions, createServer as createViteServer } from "vite";

import { resolveDoainConfig } from "./config";
import { createDoainPlugin } from "./plugins";

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
) {
  const config = await resolveDoainConfig(root);

  dns.setDefaultResultOrder("verbatim");

  return createViteServer({
    root: config.srcDir,
    cacheDir: config.cacheDir,
    server: serverOptions,
    plugins: [createDoainPlugin(config)],
  });
}
