import { rest } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

import { httpClient } from "./src/request/HttpClient";
import { setToken } from "./src/storage/token";

const BASE_URL = "http://localhost:8080";

httpClient.resetAxiosInstance({
  baseUrl: BASE_URL,
  tokenWhiteList: [],
});
setToken("MOCK_TOKEN");

const server = setupServer(
  ...[
    rest.post(`${BASE_URL}/login`, (req, res, ctx) => {
      return res(
        ctx.json({
          status: 1,
          message: "Success",
          data: {
            token: "MOCK_TOKEN",
          },
        }),
      );
    }),
    rest.post(`${BASE_URL}/user/list`, (req, res, ctx) => {
      return res(
        ctx.json({
          status: 1,
          message: "Success",
          data: {
            page: 1,
            total: 10,
            list: [
              {
                id: 1,
                name: "foo",
              },
              {
                id: 2,
                name: "bar",
              },
            ],
          },
        }),
      );
    }),
  ],
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
