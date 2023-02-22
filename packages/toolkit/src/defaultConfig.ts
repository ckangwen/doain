import { DoainClientConfig } from "./config/index";

export const mergeDefaultConfig = (config: DoainClientConfig) => {
  const defaults: Partial<DoainClientConfig> = {
    component: {
      paginationView: {
        formProps: {
          labelPosition: "left",
          labelWidth: "120px",
        },
      },
    },
  };

  return Object.assign(defaults, config);
};
