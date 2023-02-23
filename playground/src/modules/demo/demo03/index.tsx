import PageContainer from "@/components/PageContainer";
import { createInputSchema, createSchemaPipeline } from "@charrue/schema-form-next";
import { PaginationView, usePaginationView } from "@doain/toolkit";
import { ElButton } from "element-plus";
import { defineComponent } from "vue";

import { createColumns } from "../../../utils/index";

const searchSchema = createSchemaPipeline(
  createInputSchema("title", "Title"),
  createInputSchema("title2", "Title2"),
  createInputSchema("title3", "Title3"),
);
export default defineComponent({
  name: "Demo03",
  setup() {
    const sharedMethods = usePaginationView();

    const onClick = () => {
      console.log(sharedMethods.getTableData());
    };

    return {
      onClick,
    };
  },
  render() {
    return (
      <PageContainer>
        <PaginationView
          schema={searchSchema}
          url="/user/list"
          columns={createColumns([
            ["ID", "id"],
            ["Title", "title"],
          ])}
        >
          {{
            actions: () => (
              <div>
                <ElButton link type="primary" onClick={this.onClick}>
                  新增
                </ElButton>
                <ElButton link type="danger">
                  删除
                </ElButton>
              </div>
            ),
          }}
        </PaginationView>
      </PageContainer>
    );
  },
});
