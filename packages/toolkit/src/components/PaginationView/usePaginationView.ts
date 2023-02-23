import { createGlobalState } from "@vueuse/core";
import { Ref, ShallowRef, ref, shallowRef } from "vue";

interface SharedMethods {
  reload: () => Promise<any>;
  getTableData: () => any[];
  getSearchData: () => any;
  getSchemaFormRef: () => Ref<any | undefined>;
  getSchemaTableRef: () => Ref<any | undefined>;
}

/**
 * @internal
 */
export const useInternalPaginationView: () => [ShallowRef<SharedMethods>, () => void] =
  createGlobalState(() => {
    console.log("useInternalPaginationView");
    const sharedMethods = shallowRef<SharedMethods>({
      reload: () => Promise.resolve(),
      getTableData: () => [],
      getSearchData: () => ({}),
      getSchemaFormRef: () => ref(),
      getSchemaTableRef: () => ref(),
    });

    const reset = () => {
      sharedMethods.value = {
        reload: () => Promise.resolve(),
        getTableData: () => [],
        getSearchData: () => ({}),
        getSchemaFormRef: () => ref(),
        getSchemaTableRef: () => ref(),
      };
    };

    return [sharedMethods, reset];
  });

export const usePaginationView = (): SharedMethods => {
  const [sharedMethods] = useInternalPaginationView();

  return {
    reload: () => sharedMethods.value.reload(),
    getTableData: () => sharedMethods.value.getTableData(),
    getSearchData: () => sharedMethods.value.getSearchData(),
    getSchemaFormRef: () => sharedMethods.value.getSchemaFormRef(),
    getSchemaTableRef: () => sharedMethods.value.getSchemaTableRef(),
  };
};
