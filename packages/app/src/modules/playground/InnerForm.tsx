import { ElButton, ElForm, ElFormItem, ElInput } from "element-plus";

export default defineComponent({
  name: "InnerForm",
  props: {
    queryId: {
      type: [String, Number],
    },
    content: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const formData = ref({
      content: "",
    });
    const elFormRef = ref();
    watch(
      () => props.content,
      (value) => {
        if (value !== formData.value.content) {
          formData.value.content = value;
        }
      },
    );
    const mode = ref<"create" | "view" | "update">("create");
    watch(
      () => props.queryId,
      (value) => {
        console.log("queryId", value);
        if (value) {
          mode.value = "view";
        } else {
          mode.value = "create";
        }
      },
      {
        immediate: true,
      },
    );

    const onSubmit = () => {
      console.log(props);
    };
    const onCancel = () => {
      elFormRef.value?.resetFields();
      mode.value = "create";
      formData.value.content = "";
    };
    const onStartUpdate = () => {
      mode.value = "update";
    };

    const onDelete = () => {
      console.log("delete");
    };

    const onUpdate = () => {
      console.log("onUpdate");
    };

    return () => (
      <ElForm labelWidth="120px" model={formData.value} ref={elFormRef.value}>
        <ElFormItem label="Content" prop="content">
          <ElInput v-model={formData.value.content}></ElInput>
        </ElFormItem>
        {mode.value === "view" && (
          <ElFormItem>
            <ElButton type="danger" onClick={onDelete}>
              Delete
            </ElButton>
            <ElButton onClick={onStartUpdate}>Update</ElButton>
          </ElFormItem>
        )}
        {mode.value === "create" && (
          <ElFormItem>
            <ElButton onClick={onCancel}>Cancel</ElButton>
            <ElButton type="primary" onClick={onSubmit}>
              Submit
            </ElButton>
          </ElFormItem>
        )}
        {mode.value === "update" && (
          <ElFormItem>
            <ElButton onClick={onCancel}>Cancel</ElButton>
            <ElButton type="primary" onClick={onUpdate}>
              Update
            </ElButton>
          </ElFormItem>
        )}
      </ElForm>
    );
  },
});
