import { DoainClientConfig, subscribeDoainClientConfigKey } from "../config/index";

const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;
const ONE_SECOND = 1000;

export interface IStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

interface StorageOptions {
  prefix?: string;
  storage: IStorage;
}

class StorageLike {
  prefix = "";
  private storage: IStorage;
  private cachedKeys: string[] = [];
  private expireTimeConfig: NonNullable<DoainClientConfig["app"]["expireTime"]> =
    DEFAULT_CACHE_TIME;

  constructor(options: StorageOptions) {
    this.prefix = options.prefix || "";
    this.storage = options.storage;
  }

  setPrefix(p: string) {
    this.prefix = p;
  }

  // TODO: memoize
  getExpire(key?: string) {
    if (typeof this.expireTimeConfig === "number") {
      return this.expireTimeConfig;
    }

    if (!key) {
      return this.expireTimeConfig["*"] || DEFAULT_CACHE_TIME;
    }

    return this.expireTimeConfig[key] || this.expireTimeConfig["*"] || DEFAULT_CACHE_TIME;
  }

  /**
   * 设置过期时间
   * @param value number | { [key: string]: number } 单位秒
   */
  setExpire(value: typeof this.expireTimeConfig) {
    this.expireTimeConfig = value;
  }

  /**
   * 更新storage
   * @param key {string} key
   * @param value {any} value 要存储的值
   * @param expire {number | null} 过期时间，单位秒
   */
  set(key: string, value: any, expire: number | null = this.getExpire(key)) {
    const storageValue = JSON.stringify({
      value,
      expire: expire !== null ? new Date().getTime() + expire * ONE_SECOND : null,
    });

    this.storage.setItem(this.getStorageKey(key), storageValue);
    if (!this.cachedKeys.includes(key)) {
      this.cachedKeys.push(key);
    }
  }

  get(key: string, defaultValue?: any) {
    const storageValue = this.storage.getItem(this.getStorageKey(key));
    if (storageValue) {
      try {
        const data = JSON.parse(storageValue);
        const { value, expire } = data;
        if (expire === null || expire >= Date.now()) {
          return value;
        }
        this.remove(key);
      } catch (e) {
        //
        return defaultValue;
      }
    }
    return defaultValue;
  }
  remove(key: string) {
    this.storage.removeItem(this.getStorageKey(key));
  }
  clear() {
    this.cachedKeys.forEach((k) => {
      this.remove(k);
    });

    this.cachedKeys = [];
  }
  clearAll() {
    this.storage.clear();
  }

  private getStorageKey(key: string) {
    return `${this.prefix}${key}`.toUpperCase();
  }
}

export const lStorage = new StorageLike({
  storage: localStorage,
  prefix: "",
});

export const sStorage = new StorageLike({
  storage: sessionStorage,
  prefix: "",
});

subscribeDoainClientConfigKey?.("app", (config) => {
  const storageKey = config.storageKey || config.appKey || "";
  const expireTime = config.expireTime || DEFAULT_CACHE_TIME;

  lStorage.setPrefix(storageKey);
  sStorage.setPrefix(storageKey);
  lStorage.setExpire(expireTime);
  sStorage.setExpire(expireTime);
});
