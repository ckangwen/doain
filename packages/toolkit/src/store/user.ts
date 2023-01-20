import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";

import { getDoainClientConfigKey, subscribeDoainClientConfigKey } from "../config";
import { sStorage } from "../storage";

let userFetchConfig = getDoainClientConfigKey("fetch");
let userStorageConfig = getDoainClientConfigKey("store");
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
      if (result) {
        const requiredUserData = userStorageConfig.getRequiredUserData(result);
        userInfo.value = {
          ...requiredUserData,
          ...result,
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

export const useUserData = () => {
  const store = useUserStore();
  const { userInfo } = storeToRefs(store);
  return userInfo;
};
