import { CharrueSchemaForm, FormSchemaDef } from "@charrue/schema-form-next";
import { CharrueSchemaTable } from "@charrue/schema-table-next";
import { useVModel } from "@vueuse/core";
import { PropType, computed, defineComponent, h } from "vue";

import { getDoainClientConfig } from "../../config/index";
import { useTable } from "./useTable";

const paginationViewConfig = getDoainClientConfig().component?.paginationView || {};

// const defaultTableProps = {
//   tableProps: {
//     size: "medium",
//     "header-row-class-name": "global-header-row-class",
//   },
//   index: true,
//   indexHeader: "序号",
//   indexProps: {
//     width: "80px",
//   },
// };

export const PaginationView = defineComponent({
  name: "PaginationView",
  props: {
    url: {
      type: String,
      required: true,
      default: "",
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
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
  setup(props, { emit, expose }) {
    const innerValue = useVModel(props, "formData", emit);
    const shouldHideForm = computed(() => {
      return Object.keys(props.schema).length === 0;
    });
    // formData的数据并不适合直接作为参数提交给接口，需要进行转换
    const searchData = computed(() => {
      const defaultValue = {
        ...innerValue.value,
        ...props.queryData,
      };
      if (typeof props.formatSearchData === "function") {
        return props.formatSearchData(defaultValue);
      }
      return defaultValue;
    });

    const {
      loading,
      page,
      pageSize,
      total,
      tableData,
      headerScopeData,

      fetchData,
      onSizeChange,
      onPageChange,
    } = useTable(searchData);

    fetchData();

    expose({
      fetchData,
      tableData,
      searchData,
    });

    return {
      innerValue,
      shouldHideForm,
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
    return h(
      "div",
      {
        class: "pagination-view-root",
      },
      [
        this.shouldHideForm
          ? []
          : h(
              "div",
              {
                class: "pagination-view__form",
              },
              [
                h(CharrueSchemaForm, {
                  ...(paginationViewConfig.formProps || {}),
                  modelValue: this.innerValue,
                  schema: this.schema,
                  "onUpdate:modelValue": (value) => {
                    this.innerValue = value;
                  },
                }),
              ],
            ),

        h(
          "div",
          {
            class: "pagination-view__table",
          },
          [
            h(
              CharrueSchemaTable,
              {
                ...(paginationViewConfig.tableProps || {}),
                columns: this.columns,
                data: this.tableData,
                currentPage: this.page,
                pageSize: this.pageSize,
                total: this.total,
                showExtraColumn: this.showExtraColumn,
                extraColumnProps: this.extraColumnProps,
                onSizeChange: this.onSizeChange,
                onCurrentChange: this.onPageChange,
                pagination: this.pagination,
              },
              {
                header: header
                  ? () => {
                      return header({ scope: this.headerScopeData });
                    }
                  : null,
                ...rest,
              },
            ),
          ],
        ),
      ],
    );

    // return (
    //   <div class="pagination-view-root">
    //     {!this.shouldHideForm && (
    //       <div class="pagination-view__form">
    //         <CharrueSchemaForm
    //           {}
    //           v-model={this.innerValue}
    //           schema={this.schema}
    //         ></CharrueSchemaForm>
    //       </div>
    //     )}

    //     <div class="pagination-view__table">
    //       <CharrueSchemaTable
    //         v-loading={this.loading}
    //         {...(paginationViewConfig.tableProps || {})}
    //         columns={this.columns}
    //         data={this.tableData}
    //         currentPage={this.page}
    //         pageSize={this.pageSize}
    //         total={this.total}
    //         showExtraColumn={this.showExtraColumn}
    //         extraColumnProps={this.extraColumnProps}
    //         onSize-change={this.onSizeChange}
    //         onPage-change={this.onPageChange}
    //         pagination={true}
    //         {...this.$attrs}
    //       >
    //         {{
    //           header: header
    //             ? () => {
    //                 return header({ scope: this.headerScopeData });
    //               }
    //             : null,
    //           ...rest,
    //         }}
    //       </CharrueSchemaTable>
    //     </div>
    //   </div>
    // );
  },
});
