import dns from "dns";
import c from "picocolors";
import { ServerOptions, createServer as createViteServer } from "vite";

import { resolveDoainConfig } from "../config/index";
import { createDoainPlugin } from "../plugin/index";

async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
  recreateServer?: () => Promise<void>,
) {
  const config = await resolveDoainConfig({ root, command: "dev" });

  dns.setDefaultResultOrder("verbatim");

  return createViteServer({
    root: config.srcDir,
    cacheDir: config.cacheDir,
    server: serverOptions,
    plugins: [
      await createDoainPlugin({
        config,
        recreateServer,
        command: "dev",
      }),
    ],
  });
}

export async function dev(root: string, argv: any) {
  const createDevServer = async () => {
    const server = await createServer(root, argv, async () => {
      await server.close();
      await createDevServer();
    });
    await server.listen();
    console.log();
    server.printUrls();
  };
  createDevServer().catch((err) => {
    console.error(c.red(`failed to start server. error:\n`), err);
    process.exit(1);
  });
}
