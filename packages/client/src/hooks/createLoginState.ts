import { PlainObject, isFn, isPromise } from "@effective/shared";
import { ElNotification } from "element-plus";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { getEffectiveConfig } from "../config/index";
import { setToken } from "../helpers/index";
import { useUserStore } from "../store/index";
import { FetchResponse } from "../types";

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
    const onSubmitError = (err: Error, data: any) => {
      const errMsg = data?.message || err?.message || "网络错误";
      ElNotification.error({
        title: "登录失败",
        message: errMsg,
      });
    };

    /** 登录成功 */
    const onSubmitSuc = async (response: FetchResponse) => {
      const token = isPromise(getTokenAfterLogin)
        ? await getTokenAfterLogin(response)
        : getTokenAfterLogin(response);

      setToken(token.toString());
      userStore.refreshUserInfo(true);

      router.push(homeRoute);
    };

    /** 登录失败 */
    const onSubmitFailed = (response: FetchResponse) => {
      const message = response?.message || "登录失败";
      ElNotification.error({
        title: "提示",
        message,
      });
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
            hideLoading();
            return;
          }
        }

        loading.value = true;

        console.log("submitValue", login, isPromise(login));
        const [res, err] = await login(submitValue);
        hideLoading();

        if (err) {
          onSubmitError(err, res);
          return;
        }

        if (res && Number(res.status) === 1) {
          await onSubmitSuc(res);
        } else {
          onSubmitFailed(res);
        }

        if (isFn(afterLogin)) {
          afterLogin({ response: res, formValue: formValue.value });
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
