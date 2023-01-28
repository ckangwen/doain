import { CharrueSchemaForm } from "@charrue/schema-form-next";
import { ElButton, ElFormItem } from "element-plus";

import { useLogin } from "./useLogin";

definePageRoute({
  meta: {
    layout: "pure",
  },
});

export default defineComponent({
  name: "Login",
  setup() {
    const {
      elFormRef,
      formValue,
      loading,
      disabled,
      formSchema,
      formRules,

      doLogin,
    } = useLogin();

    return {
      formValue,
      loading,
      disabled,
      formSchema,
      elFormRef,
      formRules,
      doLogin,
    };
  },
  render() {
    return (
      <div class="w-400px m-auto pt-10">
        <CharrueSchemaForm
          ref="elFormRef"
          labelWidth="100px"
          labelPosition="left"
          v-model={this.formValue}
          schema={this.formSchema}
          rules={this.formRules}
        >
          {{
            extra: () => (
              <ElFormItem class="w-full">
                <ElButton
                  disabled={this.disabled}
                  loading={this.loading}
                  class="w-full"
                  type="primary"
                  onClick={this.doLogin}
                >
                  Login
                </ElButton>
              </ElFormItem>
            ),
          }}
        </CharrueSchemaForm>
      </div>
    );
  },
});
