import { isPlainObj } from "@charrue/toolkit";
import { defineStore, storeToRefs } from "pinia";
import { ComputedRef, ref } from "vue";

import { getDoainClientConfig, subscribeDoainClientConfigKey } from "../config";
import { sStorage } from "../storage";
import { DoainDefaultUserInfo } from "../types";

let userFetchConfig = getDoainClientConfig().fetch;
let userStorageConfig = getDoainClientConfig().store;
subscribeDoainClientConfigKey("fetch", (config) => {
  userFetchConfig = {
    ...userFetchConfig,
    ...config,
  };
});

subscribeDoainClientConfigKey("store", (config) => {
  userStorageConfig = {
    ...userStorageConfig,
    ...config,
  };
});

const DefaultUserInfo = {
  username: "",
  userId: 0,
};

const USERINFO_SESSION_KEY = "userInfo";
function getCachedUserInfo() {
  const cachedUserInfo = sStorage.get(USERINFO_SESSION_KEY);
  if (!cachedUserInfo) {
    sStorage.set(USERINFO_SESSION_KEY, DefaultUserInfo);
    return DefaultUserInfo;
  }
  return cachedUserInfo;
}

export const useUserStore = defineStore("appUser", () => {
  const userInfo = ref(getCachedUserInfo());
  // 是否已经加载过用户信息
  const loaded = ref(false);
  // 是否正在加载用户信息
  const loading = ref(false);

  const clearUserInfo = () => {
    userInfo.value = DefaultUserInfo;
    sStorage.remove(USERINFO_SESSION_KEY);
  };
  const refreshUserInfo = async (force = false) => {
    if (!loaded.value) {
      loaded.value = true;
      refreshUserInfo(true);
    }

    if (!userFetchConfig.fetchUserInfo) {
      console.warn("未配置 fetchUserInfo 方法");
      return;
    }

    if (force || !userInfo.value.userId) {
      loading.value = true;
      const result = await userFetchConfig.fetchUserInfo();
      loading.value = false;
      if (result.success) {
        const newValue = userStorageConfig.formatUserData(result.data);
        userInfo.value = {
          ...newValue,
          ...(isPlainObj(result.data) ? result.data : {}),
        };
        sStorage.set(USERINFO_SESSION_KEY, result);
      }
    }
  };

  return {
    userInfo,
    //
    clearUserInfo,
    refreshUserInfo,
  };
});

export const useUserData = <T extends DoainDefaultUserInfo = DoainDefaultUserInfo>() => {
  const store = useUserStore();
  const { userInfo } = storeToRefs(store);
  return userInfo as ComputedRef<T>;
};
