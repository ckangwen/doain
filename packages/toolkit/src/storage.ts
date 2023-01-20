const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7;

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
  private cacheExpireTime: number | null = DEFAULT_CACHE_TIME;
  private cachedKeys: string[] = [];

  constructor(options: StorageOptions) {
    this.prefix = options.prefix || "";
    this.storage = options.storage;
  }

  setPrefix(p: string) {
    this.prefix = p;
  }

  setExpire(time: number | null) {
    this.cacheExpireTime = time;
  }
  set(key: string, value: any, expire: number | null = this.cacheExpireTime) {
    const storageValue = JSON.stringify({
      value,
      expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
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
