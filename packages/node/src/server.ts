import dns from "dns";
import { ServerOptions, createServer as createViteServer } from "vite";

import { resolveDoainConfig } from "./config";
import { createDoainPlugin } from "./plugins";

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
  recreateServer?: () => Promise<void>,
) {
  const config = await resolveDoainConfig(root);

  dns.setDefaultResultOrder("verbatim");

  return createViteServer({
    root: config.srcDir,
    cacheDir: config.cacheDir,
    server: serverOptions,
    plugins: [await createDoainPlugin(config, recreateServer)],
  });
}
