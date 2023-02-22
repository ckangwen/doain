import { ShallowUnwrapRef, proxyRefs, watchEffect } from "vue";

type AnyFunction = (...args: any[]) => any;

export const rAF = () => new Promise((resolve) => requestAnimationFrame(resolve));

export const proxyHook = <T extends AnyFunction>(
  use: T,
): [T, () => ShallowUnwrapRef<ReturnType<T>>] => {
  let proxyValue: ShallowUnwrapRef<ReturnType<T>>;
  const proxy = (...args: Parameters<T>) => {
    const result = use(...args);
    watchEffect(() => {
      proxyValue = proxyRefs(result);
    });

    return result;
  };

  return [proxy as T, () => proxyValue];
};
