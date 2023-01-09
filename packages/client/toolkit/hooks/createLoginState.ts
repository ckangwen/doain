import { getDoainConfig, httpClient, setToken, useUserStore } from "~toolkit";

import { isFn, isPromise } from "@charrue/toolkit";
import { ElNotification } from "element-plus";
import type { NotificationOptions } from "element-plus";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

type FormValue = Record<string, any>;

export interface CreateLoginStateOptions {
  createDefaultFormValue: () => FormValue;
  createDisabledGetter?: (formValue: FormValue) => boolean;
  formatSubmitValue?: (formValue: FormValue) => FormValue;
}

export interface UseLoginOptions {
  beforeLogin?: (formValue: FormValue) => boolean;
  afterLogin?: (value: { response: any; formValue: FormValue }) => void;
}

const showMessage = (type: NotificationOptions["type"], message: string) => {
  ElNotification({
    type,
    message,
    duration: 1500,
  });
};

export const createLoginState = (options: CreateLoginStateOptions) => {
  const { createDefaultFormValue, createDisabledGetter, formatSubmitValue } = options;
  const globalConfig = getDoainConfig();

  const { homeRoute } = globalConfig.router;
  const { getTokenAfterLogin, login } = globalConfig.fetch;

  return function useLogin({ afterLogin, beforeLogin }: UseLoginOptions) {
    const router = useRouter();
    const userStore = useUserStore();

    const formValue = ref(createDefaultFormValue());
    const disabled = computed(() => {
      if (isFn(createDisabledGetter)) {
        return createDisabledGetter(formValue.value);
      }
      return false;
    });
    const loading = ref(false);
    const hideLoading = () => {
      if (loading.value === false) {
        return;
      }
      setTimeout(() => {
        loading.value = false;
      }, 300);
    };
    const elFormRef = ref();

    /** 表单校验失败 */
    const onValidateFailed = (err: any) => {
      let errMsg = err.message;
      if (err) {
        const firstErrorField = Object.values(err)[0];
        if (Array.isArray(firstErrorField) && firstErrorField?.[0]?.message) {
          errMsg = firstErrorField[0].message;
        }
      }

      if (errMsg) {
        showMessage("warning", errMsg);
      }
    };

    /** 登录接口报错 */
    const onSubmitError = (error: any, message: string) => {
      const errMsg = message || error?.message || "网络错误";
      showMessage("error", errMsg);
    };

    /** 登录成功 */
    const onSubmitSuc = async (data: FormValue, message: string) => {
      const token = isPromise(getTokenAfterLogin)
        ? await getTokenAfterLogin(data)
        : getTokenAfterLogin(data);

      setToken(token.toString());
      httpClient.refreshToken();

      if (message) {
        showMessage("success", message);
      }
      userStore.refreshUserInfo(true);

      router.push(homeRoute);
    };

    /** 登录失败 */
    const onSubmitFailed = (data: FormValue, message: string) => {
      if (message) {
        showMessage("error", message);
      }
    };

    // eslint-disable-next-line max-statements
    const doLogin = async () => {
      try {
        await elFormRef.value?.validate?.();

        const submitValue = isFn(formatSubmitValue)
          ? formatSubmitValue(formValue.value)
          : formValue.value;

        if (isFn(beforeLogin)) {
          const shouldContinue = beforeLogin(submitValue);
          if (!shouldContinue) {
            return;
          }
        }

        loading.value = true;

        const { success, data, error, message } = await login(submitValue);
        hideLoading();

        if (!success && error) {
          onSubmitError(error, message);
          return;
        }

        if (success) {
          await onSubmitSuc(data, message);
        } else {
          onSubmitFailed(data, message);
        }

        if (isFn(afterLogin)) {
          afterLogin({ response: data, formValue: formValue.value });
        }
      } catch (e: any) {
        console.error(e);
        onValidateFailed(e);
        hideLoading();
      }
    };

    const reset = () => {
      formValue.value = createDefaultFormValue();
      elFormRef.value?.clearValidate();
      hideLoading();
    };

    return {
      elFormRef,
      formValue,
      disabled,
      loading,

      doLogin,
      reset,
    };
  };
};
