import { dirname } from "path";
import { fileURLToPath } from "url";

export const APP_NAME = "doain";

export const cleanUrl = (url: string): string => url.replace(/#.*$/s, "").replace(/\?.*$/s, "");

export type NotBool<T> = T extends boolean ? never : T;

type NotNill<T> = T extends null | undefined ? never : T;

type Primitive = undefined | null | boolean | string | number | Function;

export type DeepRequired<T> = T extends Primitive
  ? NotNill<T>
  : {
      [P in keyof T]-?: T[P] extends Array<infer U>
        ? Array<DeepRequired<U>>
        : T[P] extends ReadonlyArray<infer U2>
        ? DeepRequired<U2>
        : DeepRequired<T[P]>;
    };

export const currentDir = dirname(fileURLToPath(import.meta.url));
