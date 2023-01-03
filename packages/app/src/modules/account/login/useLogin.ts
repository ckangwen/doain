import { createInputSchema, createSchemaPipeline } from "@charrue/schema-form-next";
import { createLoginState } from "@effective/client";

import { validateMobile } from "./helper";

const formSchema = createSchemaPipeline(
  createInputSchema("mobile", "手机号", {
    uiProps: {
      placeholder: "请输入手机号",
    },
  }),
  createInputSchema("password", "密码", {
    uiProps: {
      placeholder: "请输入手机号",
      type: "password",
      showPassword: true,
    },
  }),
);

const formRules = {
  mobile: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        const { success, message } = validateMobile(value);
        if (success) {
          callback();
        } else {
          callback(new Error(message));
        }
      },
    },
  ],
};

export const useLogin = () => {
  const usesPageLogin = createLoginState({
    createDefaultFormValue() {
      return {
        mobile: "17772273983",
        password: "Spg@1703",
      };
    },
    createDisabledGetter(formValue) {
      return Object.values(formValue).some((value) => !value);
    },
  });

  const { formValue, loading, disabled, doLogin } = usesPageLogin({});

  return {
    formValue,
    loading,
    disabled,
    formSchema,
    formRules,
    doLogin,
  };
};
