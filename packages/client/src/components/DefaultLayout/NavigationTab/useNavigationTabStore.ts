/* eslint-disable max-len */
import { merge } from "@charrue/toolkit";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

import { getDoainConfig } from "../../../config/index";
import { createLocalStorage } from "../../../helpers/index";
import { NormalizedRouteData, formatNormalizedRoute } from "./shared";

const globalConfig = getDoainConfig();

// 不需要出现在标签页中的路由
// const whiteList: Array<NonNullable<NormalizedRouteData["name"]>> = ["Redirect", "login"];
const lStorage = createLocalStorage();

const parseStorageValue = (key: string, defaultValue?: any) => {
  try {
    const routeStorageValue = lStorage.get(key);
    if (routeStorageValue) {
      return JSON.parse(routeStorageValue);
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

export const useNavigationTabStore = defineStore("GlobalNavigationTab", () => {
  /**
   * 可以在标签页展示的路由对象列表
   */
  const pool = ref<NormalizedRouteData[]>([]);
  /**
   * 正在标签页展示的路由对象列表
   */
  const opened = ref<NormalizedRouteData[]>([]);

  const init = (routes: Array<Partial<RouteLocationNormalizedLoaded>>) => {
    pool.value = routes.map((item) => formatNormalizedRoute(item));
  };

  const loadOpened = (defaultRoute?: NormalizedRouteData) => {
    let cachedRoutes: NormalizedRouteData[] = parseStorageValue(
      globalConfig.layout.tabViewStorageName,
      defaultRoute ? [defaultRoute] : [],
    );

    // 更新缓存的路由，路由数据可能会发生变化
    // 删除不存在的路由
    cachedRoutes = cachedRoutes
      .map((item) => {
        const matchedRoute = pool.value.find((r) => r.path === item.path);
        if (matchedRoute) {
          // 防止覆盖旧路由的query或params参数，而pool中的路由一般不会带有参数
          return merge({}, item, matchedRoute);
        }
        return null;
      })
      .filter((item) => item === null) as unknown as NormalizedRouteData[];

    if (Array.isArray(cachedRoutes) && cachedRoutes.length > 0) {
      opened.value = cachedRoutes;
    }
  };

  const add = (routeData: RouteLocationNormalizedLoaded) => {
    const normalizedRoute = formatNormalizedRoute(routeData);
    // TODO: 如果没有name
    if (!normalizedRoute.name) {
      return false;
    }
    // if (whiteList.includes(normalizedRoute.name)) return false;
    const isExists = opened.value.some((item) => item.fullPath === normalizedRoute.fullPath);
    if (!isExists) {
      opened.value.push(normalizedRoute);
    }
    return true;
  };

  const close = (
    routeData: NormalizedRouteData,
    type: "left" | "right" | "others" | "current" | "all",
  ) => {
    const currentIndex = opened.value.findIndex((item) => item.fullPath === routeData.fullPath);

    switch (type) {
      case "left": {
        opened.value = opened.value.filter(
          (item, index) => index >= currentIndex && (item.meta?.affix ?? false),
        );
        break;
      }
      case "right": {
        opened.value = opened.value.filter(
          (item, index) => index <= currentIndex && (item.meta?.affix ?? false),
        );
        break;
      }
      case "others": {
        opened.value = opened.value.filter(
          (item, index) => index === currentIndex && (item.meta?.affix ?? false),
        );
        break;
      }
      case "current": {
        opened.value.splice(currentIndex, 1);
        break;
      }
      case "all": {
        opened.value = opened.value.filter((item) => item.meta?.affix ?? false);
        break;
      }
      default:
        break;
    }
  };

  return {
    opened,
    init,
    loadOpened,
    add,
    close,
  };
});
