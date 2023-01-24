import { CharrueLayout } from "@charrue/layout-next";
import mitt, { EventType } from "mitt";
import type { RouteLocationRaw } from "vue-router";

import { HttpClientResponse, httpClient } from "./request/index";
import { lStorage, sStorage } from "./storage";

type LayoutProps = InstanceType<typeof CharrueLayout>["$props"];

interface AppConfig {
  appKey: string;
  /**
   * LocalStorage中存储的key的前缀
   * @defaultValue appKey
   */
  storageKey?: string;
}
interface LayoutConfig {
  data: NonNullable<LayoutProps["data"]>;
  collapse?: LayoutProps["collapse"];
  fixedHeader?: LayoutProps["fixedHeader"];
  showTrigger?: LayoutProps["showTrigger"];
  logo?: LayoutProps["logo"];
  title?: LayoutProps["title"];
  layout?: LayoutProps["layout"];
  sidebarWidth?: LayoutProps["sidebarWidth"];
  activeMenuRules?: LayoutProps["activeMenuRules"];
  /**
   * 是否启用导航标签页
   * @defaultValue false
   */
  enableNavigationTab?: boolean;
  /**
   * 导航标签页的数据存储的名称
   * @defaultValue "tabView"
   */
  tabViewStorageName?: string;
  ignoreNavigationTabKey?: string;
}

interface StoreConfig<GlobalUserInfo> {
  getRequiredUserData: (userInfo: GlobalUserInfo) => GlobalUserInfo;
}

interface FetchConfig {
  /**
   * 请求的基础路径
   */
  baseUrl: string;
  /**
   * 不需要token的请求路径
   */
  tokenWhiteList?: string[];
  /**
   * 获取用户信息的请求
   */
  fetchUserInfo: () => Promise<HttpClientResponse>;
  /**
   * 登录的请求
   */
  login: (data: any) => Promise<HttpClientResponse>;
  /**
   * 获取登录后的token
   */
  getTokenAfterLogin: (data: any) => string | Promise<string>;
}

interface ComponentConfig {
  paginationView?: {
    formatColumnValue?: (key: string, value: any) => any;
    formatQueryValue?: (key: string, value: any) => any;
  };
}

interface RouterConfig {
  /**
   * 登录页路由
   * @defaultValue /account/login
   * */
  loginRoute?: RouteLocationRaw;
  /**
   * 首页路由
   * @defaultValue /
   * */
  homeRoute?: RouteLocationRaw;
  /**
   * 路由跳转前是否需要判断token
   * */
  enableTokenAuth?: boolean;
  /**
   * 无论是否有token，都可以直接访问的路由
   * */
  unimpededRoutes?: string[];
  /**
   * 只能在未登录情况下访问的页面
   * 如果已登录，访问这些页面会自动跳转到homeRoute
   * */
  unloggedOnlyRoutes?: string[];
}

export interface DoainClientConfig<GlobalUserInfo = Record<string, any>> {
  app: AppConfig;
  layout: LayoutConfig;
  store: StoreConfig<GlobalUserInfo>;
  fetch: FetchConfig;
  component?: ComponentConfig;
  router: RouterConfig;
}

type ConfigKey = keyof DoainClientConfig;
type DoainConfigValueOf<T extends ConfigKey> = DoainClientConfig[T];

const DefaultLayoutConfig: LayoutConfig = {
  logo: "",
  title: "",
  collapse: false,
  layout: "mix",
  sidebarWidth: [54, 200],
  tabViewStorageName: "tabView",
  ignoreNavigationTabKey: "navigationTab",
  data: [],
};

const DefaultRouteConfig: RouterConfig = {
  enableTokenAuth: false,
  homeRoute: "/",
  loginRoute: "/account/login",
  unloggedOnlyRoutes: ["/account/login"],
};

interface Events extends Record<EventType, unknown> {
  "*": DoainClientConfig;
  app: DoainClientConfig["app"];
  layout: DoainClientConfig["layout"];
  store: DoainClientConfig["store"];
  fetch: DoainClientConfig["fetch"];
  router: DoainClientConfig["router"];
}

export const defaultDoainClientConfig: DoainClientConfig = {
  app: {
    appKey: "",
    storageKey: "",
  },
  layout: DefaultLayoutConfig,
  store: {
    getRequiredUserData() {
      return {};
    },
  },
  fetch: {
    baseUrl: "",
    async fetchUserInfo() {
      return {} as any;
    },
    async login() {
      return {} as any;
    },
    getTokenAfterLogin() {
      return "";
    },
  },
  router: DefaultRouteConfig,
};

class GlobalDoainConfig {
  private _config: DoainClientConfig = defaultDoainClientConfig;
  private emitter = mitt<Events>();

  defineDoainConfig = (config: DoainClientConfig) => {
    this.set("app", {
      appKey: config.app.appKey,
      storageKey: config.app.storageKey || config.app.appKey,
    });
    this.set("layout", {
      ...DefaultLayoutConfig,
      ...(config.layout || {}),
    });
    this.set("store", config.store);
    this.set("fetch", config.fetch);
    this.set("router", {
      ...DefaultRouteConfig,
      ...(config.router || {}),
    });

    this.emitter.emit("*", this._config!);

    return this._config;
  };

  get config() {
    return this._config;
  }

  get<T extends ConfigKey>(key: T): DoainClientConfig[T] {
    return this._config![key];
  }

  set = <T extends ConfigKey>(key: T, value: DoainClientConfig[T]) => {
    this._config![key] = value;
    this.emitter.emit(key as keyof Events, value);
  };

  subscribe = <N extends ConfigKey>(
    name: N,
    cb: (config: N extends ConfigKey ? DoainConfigValueOf<N> : DoainClientConfig) => void,
  ) => {
    this.emitter.on(name, (type: any) => {
      cb(type);
    });
  };
}

const globalDoainConfig = new GlobalDoainConfig();

interface Context {
  httpClient: typeof httpClient;
  lStorage: typeof lStorage;
  sStorage: typeof sStorage;
}

export const defineClientConfig = (cb: (context: Context) => DoainClientConfig) => {
  const config = cb({
    httpClient,
    lStorage,
    sStorage,
  });
  globalDoainConfig.defineDoainConfig(config);

  httpClient.resetAxiosInstance({
    baseUrl: config.fetch.baseUrl,
    tokenWhiteList: config.fetch.tokenWhiteList || [],
  });

  lStorage.setPrefix(config.app.appKey || config.app.storageKey || "");
  sStorage.setPrefix(config.app.appKey || config.app.storageKey || "");
  return config;
};

export function getDoainClientConfig() {
  return globalDoainConfig.config;
}

export function getDoainClientConfigKey<T extends ConfigKey>(key: T) {
  return globalDoainConfig.get(key);
}

export function setDoainClientConfig<T extends ConfigKey>(key: T, value: DoainClientConfig[T]) {
  globalDoainConfig.set(key, value);
}

export function subscribeDoainClientConfigKey<N extends ConfigKey>(
  name: N,
  cb: (config: N extends ConfigKey ? DoainConfigValueOf<N> : DoainClientConfig) => void,
) {
  globalDoainConfig.subscribe(name, cb);
}