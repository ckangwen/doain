import { FormSchemaDef } from "@charrue/schema-form-next";
import { sleep } from "@charrue/toolkit";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { PropType, defineComponent, h, ref, watch } from "vue";

import { useTable } from "../src/components/PaginationView/useTable";
import { proxyHook, rAF } from "./utils";

const [useProxyTable, getProxyValue] = proxyHook(useTable);

describe("useTable", () => {
  let requestCount = 0;
  const Child = defineComponent({
    name: "child",
    props: {
      formData: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
      },
      schema: {
        type: Object as PropType<Record<string, FormSchemaDef>>,
        default: () => ({}),
      },
      queryData: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
      },
      pagination: {
        type: Boolean,
        default: true,
      },
      url: {
        type: String,
        default: "",
      },
      columns: {
        type: Array as PropType<any[]>,
        default: () => [],
      },
      paginationField: {
        type: String,
        default: "list",
      },
      formatRow: {
        type: Function,
      },
      showExtraColumn: {
        type: Boolean,
        default: true,
      },
      getHeaderScopeData: {
        type: Function,
      },
      extraColumnProps: {
        type: Object,
        default: () => ({}),
      },
      formatSearchData: {
        type: Function as PropType<(data: Record<string, any>) => Record<string, any>>,
      },
    },
    setup() {
      const { fetchData, tableData } = useProxyTable();

      watch(tableData, () => {
        requestCount += 1;
      });

      fetchData();
    },
    render() {
      return h("div");
    },
  });

  const createParentComp = (options: { queryData?: Record<string, any> } = {}) => {
    return defineComponent({
      name: "parent",
      render() {
        return h(Child, {
          url: "/user/list",
          paginationField: "list",
          queryData: options.queryData,
        });
      },
    });
  };

  beforeEach(() => {
    requestCount = 0;
  });

  test("tableData should get data", async () => {
    mount(createParentComp());
    await rAF();
    const proxyValue = getProxyValue();
    expect(proxyValue.tableData.length).toBeGreaterThan(0);
    expect(proxyValue.total).toBeGreaterThan(0);
    expect(proxyValue.loading).toBe(false);
    expect(proxyValue.page).toBe(1);
    expect(proxyValue.pageSize).toBe(10);
  });

  test("change page and size", async () => {
    mount(createParentComp());
    await rAF();
    const proxyValue = getProxyValue();

    proxyValue.onPageChange(2);
    await rAF();
    expect(proxyValue.page).toBe(2);
    expect(proxyValue.tableData.length).toBeGreaterThan(0);

    proxyValue.onSizeChange(20);
    await rAF();
    expect(proxyValue.pageSize).toBe(20);
    expect(proxyValue.page).toBe(1);
    expect(proxyValue.tableData.length).toBeGreaterThan(0);

    expect(requestCount).toBe(3);
  });

  test("change queryData", async () => {
    const queryData = ref<Record<string, any>>({ name: "" });
    mount(createParentComp({ queryData: queryData.value }));
    await rAF();

    queryData.value.name = "test";
    await rAF();
    expect(requestCount).toBe(2);

    queryData.value.name = "test2";
    await rAF();
    expect(requestCount).toBe(2);

    await sleep(200);
    expect(requestCount).toBe(3);
  });
});
