import { resolve } from "path";
import type { AliasOptions } from "vite";

const getAlias = (): AliasOptions => {
  return {
    "@/": resolve(__dirname, "src/"),
    "~components": resolve(__dirname, "src/components/index.ts"),
    "~constants": resolve(__dirname, "src/constants/index.ts"),
  };
};

const alias = getAlias();
export default alias;
