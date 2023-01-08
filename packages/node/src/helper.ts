import _debug from "debug";

export const APP_NAME = "doain";

export const createDebug = (name: string) => {
  return _debug(`${APP_NAME}:${name}`);
};

export type Awaitable<T> = T | PromiseLike<T>;
export const cleanUrl = (url: string): string => url.replace(/#.*$/s, "").replace(/\?.*$/s, "");
