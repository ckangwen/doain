import { has } from "@doain/shared";
import { describe, expect, test } from "vitest";

import { setToken } from "../src/helpers/token";
import { HttpClient } from "../src/request/HttpClient";
import { BASE_URL, sleep } from "./helper";

const httpClient = new HttpClient({
  baseUrl: BASE_URL,
});

describe("HttpClient", () => {
  test("request", async () => {
    const res = await httpClient.request({
      url: "/info",
    });
    expect(res.success).toBe(true);
    expect(typeof res.data).toBe("string");
    expect(res.error).toBe(null);
  });

  test("limitRepeatedRequest", async () => {
    const request = async (data = {}) => {
      return httpClient.limitRepeatedRequest({
        url: "/info",
        data,
      });
    };
    const res = await request();
    const prevData = res.data;

    const res2 = await request();
    expect(res2.data).toBe(prevData);

    const res3 = await request({ msg: "foo" });
    expect(res3.data).not.toBe(prevData);

    await sleep(1100);

    const res4 = await request();

    expect(res4.data).not.toBe(prevData);
  });

  test("subscribe", async () => {
    httpClient.subscribe("/info", (payload) => {
      const [res, err] = payload;
      expect(res?.status).toBe(1);
      expect(typeof res?.data).toBe("string");
      expect(err).toBe(null);
    });

    await httpClient.request({
      url: "/info",
    });
  });

  test("getState", async () => {
    await httpClient.request({
      url: "/info",
    });

    const { noTokenRequestList, abortControllerMap, repeatedRequestList } = httpClient.getState();

    expect(noTokenRequestList.length).toBe(1);
    expect(noTokenRequestList[0].url).toBe("/info");

    await httpClient.limitRepeatedRequest({
      url: "/info",
    });

    expect(noTokenRequestList.length).toBe(2);
    expect(noTokenRequestList[1].url).toBe("/info");

    expect(has(abortControllerMap, "/info")).toBe(true);

    await httpClient.limitRepeatedRequest({
      url: "/info",
    });
    expect(noTokenRequestList.length).toBe(2);

    expect(has(repeatedRequestList, "/info")).toBe(true);
    expect(has(repeatedRequestList["/info"], "{}")).toBe(true);
  });

  test.only("token", async () => {
    setToken("");

    expect(httpClient.token).toBe("");

    await httpClient.request({
      url: "/info",
    });

    expect(httpClient.getState().noTokenRequestList.length).toBe(1);
    expect(has(httpClient.getState().abortControllerMap, "/info")).toBe(true);

    setToken("foo");
    expect(httpClient.token).toBe("foo");
    setToken("bar");
    expect(httpClient.token).toBe("foo");

    httpClient.refreshToken();

    expect(httpClient.token).toBe("bar");

    await httpClient.request({
      url: "/get",
    });

    expect(httpClient.getState().noTokenRequestList.length).toBe(0);
    expect(has(httpClient.getState().abortControllerMap, "/info")).toBe(false);
  });
});
