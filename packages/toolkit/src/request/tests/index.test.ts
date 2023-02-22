import { describe, expect, test } from "vitest";

import { httpClient } from "../HttpClient";

describe("request", () => {
  test("request", async () => {
    const res = await httpClient.request({
      url: "/login",
    });

    expect(res.success).toBe(true);
    expect(res.data).toEqual({
      token: "MOCK_TOKEN",
    });
  });
});
