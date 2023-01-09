import { DoainConfig } from "./config";

export function createVirtualDoainContent(config: DoainConfig) {
  return `${config.builtPlugins.unocss === false ? "" : "import 'uno.css';"}`;
}
