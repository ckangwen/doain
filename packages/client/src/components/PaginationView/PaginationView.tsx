import { CharrueSchemaForm, FormSchemaDef } from "@charrue/schema-form-next";
import { isEmpty } from "@charrue/toolkit";
import { PropType, Slot, computed, defineComponent, ref } from "vue";

import { createFromSchemaDefaultValue } from "../../helpers/index";
import { PaginationTable } from "./PaginationTable";
import { createFormatRowFactory, formatQueryValue } from "./helper";
import { PaginationViewComponents, getPaginationViewComponents } from "./register";
import { useInternalPaginationView } from "./useApi";

const defaultTableProps = {
  tableProps: {
    size: "medium",
    "header-row-class-name": "global-header-row-class",
  },
  index: true,
  indexHeader: "序号",
  indexProps: {
    width: "80px",
  },
};

const FormSlotPrefix = "form:";
const TableSlotPrefix = "table:";

export const PaginationView = defineComponent({
  name: "PaginationView",
  props: {
    unifiedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    schema: {
      type: Object as PropType<Record<string, FormSchemaDef>>,
      default: () => {
        return {};
      },
    },
    queryData: {
      type: Object as PropType<Record<string, any>>,
      default: () => {
        return {};
      },
    },
    columns: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    url: {
      type: String,
      default: "",
    },
    paginationField: {
      type: String,
      default: "list",
    },
    showExtraColumn: {
      type: Boolean,
      default: true,
    },
    extraColumnProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    pagination: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { getQueryValue } = useInternalPaginationView();

    const shouldHideForm = isEmpty(props.schema);
    // 生成字段初始值，不至于访问字段时为undefined
    const formData = ref(createFromSchemaDefaultValue(props.schema));
    // formData的数据并不适合直接作为参数提交给接口，需要进行转换
    const searchData = computed(() => {
      return {
        ...formatQueryValue(formData.value),
        ...props.queryData,
      };
    });

    getQueryValue.value = () => searchData.value;

    const formatRow = createFormatRowFactory(props.columns, props.url);

    return {
      formData,
      searchData,
      shouldHideForm,
      formatRow,
    };
  },
  render() {
    const globalSlots = getPaginationViewComponents();
    const formSlots = {} as unknown as Record<string, Slot>;
    const tableSlots = {} as unknown as Record<string, Slot>;

    Object.keys(this.$slots).forEach((k) => {
      if (k.startsWith(FormSlotPrefix)) {
        formSlots[k.replace(FormSlotPrefix, "")] = this.$slots[k]!;
      }
      if (k.startsWith(TableSlotPrefix)) {
        tableSlots[k.replace(TableSlotPrefix, "")] = this.$slots[k]!;
      }
    });

    const globalFormSlots = Object.keys(globalSlots.form).reduce((acc, key) => {
      acc[key] = () => globalSlots.form[key]({ value: this.formData[key] });
      return acc;
    }, {} as unknown as PaginationViewComponents["form"]);

    const globalTableSlots = Object.keys(globalSlots.table).reduce((acc, key) => {
      acc[key] = ({ row, column, $index }: any) =>
        globalSlots.table[key]({
          row,
          column,
          $index,
        });
      return acc;
    }, {} as unknown as PaginationViewComponents["form"]);

    return (
      <div class="pagination-view-root">
        {!this.shouldHideForm && (
          <div class="pagination-view__form-container">
            <CharrueSchemaForm
              v-model={this.formData}
              class="pagination-view__form"
              label-position="right"
              label-width="120px"
              schema={this.schema}
            >
              {{
                ...globalFormSlots,
                ...formSlots,
              }}
            </CharrueSchemaForm>
          </div>
        )}

        <div class="pagination-view__table">
          <PaginationTable
            class="pagination-view__table"
            url={this.url}
            columns={this.columns}
            queryData={this.searchData}
            pagination={this.pagination}
            paginationField={this.paginationField}
            showExtraColumn={this.showExtraColumn}
            formatRow={this.formatRow}
            extraColumnProps={this.extraColumnProps}
            {...defaultTableProps}
          >
            {{
              ...globalTableSlots,
              ...tableSlots,
            }}
          </PaginationTable>
        </div>
      </div>
    );
  },
});
