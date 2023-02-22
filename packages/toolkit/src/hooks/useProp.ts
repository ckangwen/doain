import { computed, getCurrentInstance } from "vue";
import type { ComputedRef } from "vue";

export const useProp = <T>(name: string, defaultValue: T): ComputedRef<T> => {
  const vm = getCurrentInstance();
  return computed(() => {
    const props = vm?.proxy?.$props as Record<string, any> | undefined;
    return props?.[name] ?? defaultValue;
  });
};
