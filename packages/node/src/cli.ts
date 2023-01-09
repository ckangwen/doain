import minimist from "minimist";
import c from "picocolors";

import { version } from "../package.json";
import { createServer } from "./server";

const argv: any = minimist(process.argv.slice(2));

console.log(c.cyan(`doain v${version}`));

const command = argv._[0];
const root = argv._[command ? 1 : 0];
if (root) {
  argv.root = root;
}

if (!command || command === "dev") {
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
