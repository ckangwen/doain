import _debug from "debug";

export const APP_NAME = "doain";

export const createDebug = (name: string) => {
  return _debug(`${APP_NAME}:${name}`);
};

export const cleanUrl = (url: string): string => url.replace(/#.*$/s, "").replace(/\?.*$/s, "");

export type Awaitable<T> = T | PromiseLike<T>;

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

export const isObj = (val: unknown): val is Record<string, unknown> => typeof val === "object";
