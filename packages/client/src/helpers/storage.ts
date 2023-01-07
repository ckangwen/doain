import { getDoainConfig } from "../config/index";

const globalConfig = getDoainConfig();
const STORAGE_KEY = globalConfig.app.storageKey;
const VERSION = globalConfig.app.version;

const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

interface StorageOptions {
  prefix?: string;
  storage: StorageLike;
}

export const createStorage = <K extends string = string>(options: StorageOptions) => {
  const { prefix, storage } = options;

  const getStorageKey = (key: string) => `${prefix}${key}`.toUpperCase();

  let cacheExpireTime: number | null = DEFAULT_CACHE_TIME;
  const setExpire = (time: number | null) => {
    cacheExpireTime = time;
  };

  const removeStorage = (key: K) => {
    storage.removeItem(getStorageKey(key));
  };

  const getStorage = (key: K, defaultValue: any = null) => {
    const storageValue = storage.getItem(getStorageKey(key));
    if (storageValue) {
      try {
        const data = JSON.parse(storageValue);
        const { value, expire } = data;
        if (expire === null || expire >= Date.now()) {
          return value;
        }
        removeStorage(key);
      } catch (e) {
        //
        return defaultValue;
      }
    }
    return defaultValue;
  };

  const setStorage = (key: K, value: any, expire: number | null = cacheExpireTime) => {
    const storageValue = JSON.stringify({
      value,
      expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
    });

    storage.setItem(getStorageKey(key), storageValue);
  };

  const clear = () => {
    storage.clear();
  };

  return {
    setExpire,
    get: getStorage,
    remove: removeStorage,
    set: setStorage,
    clear,
  };
};

let _localStorageValue: ReturnType<typeof createStorage>;

let _sessionStorageValue = createStorage({
  storage: sessionStorage,
  prefix: STORAGE_KEY,
});

export function createLocalStorage() {
  if (!_localStorageValue) {
    _localStorageValue = createStorage({
      storage: localStorage,
      prefix: `${STORAGE_KEY}${VERSION ? `_${VERSION}` : ""}`,
    });
  }
  return _localStorageValue;
}
export function createSessionStorage() {
  if (!_sessionStorageValue) {
    _sessionStorageValue = createStorage({
      storage: sessionStorage,
      prefix: `${STORAGE_KEY}${VERSION ? `_${VERSION}` : ""}`,
    });
  }
  return _sessionStorageValue;
}
