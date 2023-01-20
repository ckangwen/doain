import { createInputSchema, createSchemaPipeline } from "@charrue/schema-form-next";
import { createLoginState, elFormMobileRule } from "@doain/toolkit";

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
  mobile: [elFormMobileRule],
};

export const useLogin = () => {
  const usesPageLogin = createLoginState({
    createDefaultFormValue() {
      return {
        mobile: "13445661640",
        password: "123456",
      };
    },
    createDisabledGetter(formValue) {
      return Object.values(formValue).some((value) => !value);
    },
  });

  const { formValue, loading, disabled, elFormRef, doLogin } = usesPageLogin({});

  return {
    formValue,
    loading,
    disabled,
    formSchema,
    formRules,
    elFormRef,
    doLogin,
  };
};
