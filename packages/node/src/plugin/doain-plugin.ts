import { Command, UserConfig } from "../config/types";

export interface DoainPlugin {
  name: string;
  command?: Command;
  vite?: UserConfig["vite"];
  build?: UserConfig["build"];
  html?: UserConfig["html"];
  buildEnd?: UserConfig["buildEnd"];
}

export const definePlugin = <T = never>(fn: (options?: T) => DoainPlugin) => {
  return (options?: T) => {
    return fn(options);
  };
};
