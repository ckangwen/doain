import { describe, expect, test } from "vitest";
import { ref } from "vue";

import { proxyHook } from "./utils";

const useCounter = () => {
  const count = ref(0);
  const increment = () => {
    count.value += 1;
  };
  const decrement = () => {
    count.value -= 1;
  };
  return { increment, decrement, count };
};

const [useProxyCounter, getProxyValue] = proxyHook(useCounter);

describe("utils", () => {
  test("proxyHook", () => {
    const { increment } = useProxyCounter();

    increment();
    increment();

    expect(getProxyValue().count).toBe(2);
  });
});
