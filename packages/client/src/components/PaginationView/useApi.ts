import type { TableData } from "@charrue/schema-table-next";
import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";

type Reload = () => Promise<void>;
type GetTableData = () => TableData[];
type GetQueryValue = () => Record<string, any>;

const createMap = (max: number) => {
  const map = new Map();

  return {
    get: (key: string) => map.get(key),
    set: (key: string, value: any) => {
      console.log("map.size", map.size, key);
      // 如果map的长度超过10，就删除最早的那个
      if (map.size >= max) {
        map.delete(map.keys().next().value);
      }
      map.set(key, value);
    },
  };
};

interface PaginationCacheOptions {
  page: number;
  size: number;
  url: string;
}

type PaginationCacheGetterOptions = PaginationCacheOptions & {
  data: TableData[];
};

/**
 * @internal
 */
export const useInternalPaginationView = createGlobalState(() => {
  // 缓存列表数据
  const cachedTableDataMap = createMap(10);
  const setCache = ({ url, page, data }: PaginationCacheGetterOptions) => {
    // cachedTableDataMap.value[url] = data;
    cachedTableDataMap.set(`${url}_${page}`, data);
  };
  const getCache = ({ url, page }: PaginationCacheOptions) =>
    cachedTableDataMap.get(`${url}_${page}`) || [];

  const getQueryValue = ref<GetQueryValue>(() => {
    return {};
  });

  const reload = ref<Reload>(() => Promise.resolve());
  const getTableData = ref<GetTableData>(() => []);

  return {
    getCache,
    setCache,

    /**
     * 重新加载数据, 一般用于刷新
     */
    reload,
    /**
     * 用于获取当前列表数据
     */
    getTableData,
    /**
     * 用于获取当前查询条件
     */
    getQueryValue,
  };
});

export const usePaginationView = () => {
  const { reload, getTableData, getQueryValue } = useInternalPaginationView();

  return {
    reload: () => reload.value(),
    getTableData: () => getTableData.value(),
    getQueryValue: () => getQueryValue.value(),
  };
};
