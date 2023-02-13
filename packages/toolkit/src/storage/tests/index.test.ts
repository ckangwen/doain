import { sleep } from "@charrue/toolkit";
import { describe, expect, test } from "vitest";

import { cookieStorage, lStorage, sStorage } from "../index";

describe("storage", () => {
  test("localStorage", () => {
    lStorage.set("key", "value");
    expect(lStorage.get("key")).toBe("value");
  });

  test("sessionStorage", () => {
    sStorage.set("key", "value");
    expect(sStorage.get("key")).toBe("value");
  });

  test("expire", async () => {
    lStorage.setExpire(1);

    lStorage.set("key", "value");
    expect(lStorage.get("key")).toBe("value");

    await sleep(1000);

    expect(lStorage.get("key")).toBe(undefined);

    lStorage.set("key2", "value2", 1 * 2);
    expect(lStorage.get("key2")).toBe("value2");
    await sleep(1000);
    expect(lStorage.get("key2")).toBe("value2");
    await sleep(1000);
    expect(lStorage.get("key2")).toBe(undefined);
  });

  test("set different expire time for different key", async () => {
    lStorage.setExpire({
      "*": 1,
      key1: 2,
      key2: 3,
    });

    lStorage.set("key", "value");
    lStorage.set("key1", "value1");
    lStorage.set("key2", "value2");

    expect(lStorage.get("key")).toBe("value");
    expect(lStorage.get("key1")).toBe("value1");
    expect(lStorage.get("key2")).toBe("value2");

    await sleep(1000);
    expect(lStorage.get("key")).toBe(undefined);
    expect(lStorage.get("key1")).toBe("value1");
    expect(lStorage.get("key2")).toBe("value2");

    await sleep(1000);
    expect(lStorage.get("key")).toBe(undefined);
    expect(lStorage.get("key1")).toBe(undefined);
    expect(lStorage.get("key2")).toBe("value2");

    await sleep(1000);
    expect(lStorage.get("key")).toBe(undefined);
    expect(lStorage.get("key1")).toBe(undefined);
    expect(lStorage.get("key2")).toBe(undefined);
  });
});

describe("cookie", () => {
  test("basic usage", () => {
    const KEY = "KEY";
    const VALUE = "VALUE";

    expect(cookieStorage.get(KEY)).toBe(undefined);

    cookieStorage.set(KEY, VALUE);
    expect(cookieStorage.get(KEY)).toBe(VALUE);
  });
});
