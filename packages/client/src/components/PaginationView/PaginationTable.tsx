import { CharrueSchemaTable, ColumnSchemaVO } from "@charrue/schema-table-next";
import { ElNotification } from "element-plus";
import { PropType, defineComponent, ref, watch } from "vue";

import { httpClient } from "../../request/index";
import { useInternalPaginationView } from "./useApi";

export const PaginationTable = defineComponent({
  name: "PaginationTable",
  props: {
    pagination: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
      default: "",
    },
    columns: {
      type: Array as PropType<ColumnSchemaVO[]>,
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
    queryData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    getHeaderScopeData: {
      type: Function,
    },
    extraColumnProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const loading = ref(false);
    const page = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    const headerScopeData = ref<Record<string, any>>({});

    const { setCache, getCache, reload, getTableData } = useInternalPaginationView();

    const tableData = ref<any[]>(
      getCache({
        url: props.url,
        page: page.value,
        size: pageSize.value,
      }),
    );

    /**
     * 重置内部状态
     */
    const resetState = () => {
      loading.value = false;
      page.value = 1;
      pageSize.value = 10;
      total.value = 0;
      tableData.value = [];
      headerScopeData.value = {};
      setCache({
        url: props.url,
        page: page.value,
        size: pageSize.value,
        data: [],
      });
    };

    const showMessage = (message: string) => {
      if (message) {
        ElNotification.error({
          title: "提示",
          message,
        });
      }
    };

    const fetchData = async () => {
      if (loading.value) return;
      loading.value = true;
      const paginationParams = props.pagination
        ? {
            page: page.value,
            limit: pageSize.value,
          }
        : {};

      const { data, success, error, message } = await httpClient.request({
        url: props.url,
        data: {
          ...paginationParams,
          ...props.queryData,
        },
      });

      if (!success && error) {
        resetState();
        showMessage("网络错误");
        return;
      }

      if (success) {
        const list = props.paginationField ? data[props.paginationField] : data;
        setCache({
          url: props.url,
          page: page.value,
          size: pageSize.value,
          data: list,
        });
        tableData.value = props.formatRow ? list.map(props.formatRow) : list;

        total.value = data.total || 0;
        loading.value = false;

        if (typeof props.getHeaderScopeData === "function") {
          headerScopeData.value = props.getHeaderScopeData(data);
        }
      } else {
        resetState();

        showMessage(message);
      }
    };

    reload.value = fetchData;
    getTableData.value = () => tableData.value;

    watch(
      () => props.queryData,
      () => {
        fetchData();
      },
      {
        deep: true,
        immediate: true,
      },
    );

    // events
    const onSizeChange = (size: number) => {
      if (size) {
        pageSize.value = size;
      }
      fetchData();
    };
    const onPageChange = (p: number) => {
      if (p) {
        page.value = p;
      }

      fetchData();
    };

    return {
      loading,
      tableData,
      total,
      page,
      pageSize,
      headerScopeData,

      onSizeChange,
      onPageChange,
    };
  },
  render() {
    const { header, ...rest } = this.$slots;
    return (
      <CharrueSchemaTable
        v-loading={this.loading}
        columns={this.columns}
        data={this.tableData}
        currentPage={this.page}
        pageSize={this.pageSize}
        total={this.total}
        showExtraColumn={this.showExtraColumn}
        extraColumnProps={this.extraColumnProps}
        onSize-change={this.onSizeChange}
        onCurrentChange={this.onPageChange}
        pagination={true}
        {...this.$attrs}
      >
        {{
          header: header ? () => header({ scope: this.headerScopeData }) : null,
          ...rest,
        }}
      </CharrueSchemaTable>
    );
  },
});
