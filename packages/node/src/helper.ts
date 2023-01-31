import { has } from "@charrue/toolkit";
import _debug from "debug";

import { Command, HtmlObjectOption, HtmlOption } from "./config/types";

export const APP_NAME = "doain";

export const createDebug = (name: string) => {
  return _debug(`${APP_NAME}:${name}`);
};

export const cleanUrl = (url: string): string => url.replace(/#.*$/s, "").replace(/\?.*$/s, "");

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

export const getHtmlOptionValue = <
  V extends HtmlOption<any>,
  R = V extends HtmlOption<infer U> ? U : V,
>(
  htmlOption: V,
  command?: Command,
): R | undefined => {
  if (has(htmlOption, "command") && has(htmlOption, "value")) {
    const htmlOptionObj = htmlOption as HtmlObjectOption<unknown>;
    const htmlOptionValue = htmlOptionObj.value as R;

    return command === htmlOptionObj.command || !command ? htmlOptionValue : undefined;
  }
  return htmlOption as unknown as R;
};

export const isObjectHtmlOption = (htmlOption: unknown): htmlOption is HtmlObjectOption<any> => {
  return has(htmlOption, "command") && has(htmlOption, "value");
};
