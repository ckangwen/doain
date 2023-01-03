import { getEffectiveConfig, onEffectiveConfigChange } from "../config/index";
import { createRequest } from "./http";

export type { CreateRequestOptions } from "./http";

const config = getEffectiveConfig();

let _request = createRequest({
  baseUrl: config.fetch.baseUrl,
  adaptor: config.fetch.adaptor,
});

onEffectiveConfigChange((changed) => {
  if (changed.fetch.baseUrl !== config.fetch.baseUrl) {
    _request = createRequest({
      baseUrl: changed.fetch.baseUrl,
      adaptor: changed.fetch.adaptor,
    });
  }
});

type RequestParams = Parameters<typeof _request>;
function request(...args: RequestParams) {
  return _request(...args);
}

export { createRequest, request };
