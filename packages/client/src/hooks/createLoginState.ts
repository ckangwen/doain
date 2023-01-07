import { PlainObject, isFn, isPromise } from "@effective/shared";
import { ElNotification } from "element-plus";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { getEffectiveConfig } from "../config/index";
import { setToken } from "../helpers/index";
import { httpClient } from "../request/index";
import { useUserStore } from "../store/index";

export interface CreateLoginStateOptions {
  createDefaultFormValue: () => PlainObject;
  createDisabledGetter?: (formValue: PlainObject) => boolean;
  formatSubmitValue?: (formValue: PlainObject) => PlainObject;
}

export interface UseLoginOptions {
  beforeLogin?: (formValue: PlainObject) => boolean;
  afterLogin?: (value: { response: any; formValue: PlainObject }) => void;
}

export const createLoginState = (options: CreateLoginStateOptions) => {
  const { createDefaultFormValue, createDisabledGetter, formatSubmitValue } = options;
  const globalConfig = getEffectiveConfig();

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
        ElNotification.warning({
          title: "提示",
          message: errMsg,
        });
      }
    };

    /** 登录接口报错 */
    const onSubmitError = (error: any, message: string) => {
      const errMsg = message || error?.message || "网络错误";
      ElNotification.error({
        title: "登录失败",
        message: errMsg,
      });
    };

    /** 登录成功 */
    const onSubmitSuc = async (data: PlainObject, message: string) => {
      const token = isPromise(getTokenAfterLogin)
        ? await getTokenAfterLogin(data)
        : getTokenAfterLogin(data);

      setToken(token.toString());
      httpClient.refreshToken();

      if (message) {
        ElNotification.success({
          title: "提示",
          message,
        });
      }
      userStore.refreshUserInfo(true);

      router.push(homeRoute);
    };

    /** 登录失败 */
    const onSubmitFailed = (data: PlainObject, message: string) => {
      if (message) {
        ElNotification.error({
          title: "提示",
          message,
        });
      }
    };

    // eslint-disable-next-line max-statements
    const doLogin = async () => {
      console.log("doLogin", elFormRef);
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
