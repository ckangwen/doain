import minimist from "minimist";
import c from "picocolors";

import { version } from "../package.json";

const argv: any = minimist(process.argv.slice(2));

console.log(c.cyan(`doain v${version}`));

const command = argv._[0];
const root = argv._[command ? 1 : 0];
if (root) {
  argv.root = root;
}

async function start() {
  if (!command || command === "dev") {
    const { dev } = await import("./command/dev");
    await dev(root, argv);
  } else if (command === "build") {
    const { build } = await import("./command/build");
    await build(root, argv);
  } else if (command === "preview") {
    const { preview } = await import("./command/preview");
    await preview(root, argv);
  }
}

start();
