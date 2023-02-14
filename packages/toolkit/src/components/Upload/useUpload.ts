/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ElNotification,
  UploadHooks,
  UploadRequestHandler,
  UploadRequestOptions,
  UploadStatus,
} from "element-plus";
import { Ref, reactive, ref, watch } from "vue";

import { getDoainClientConfig } from "../../config/index";
import { useProp } from "../../hooks/useProp";
import { httpClient } from "../../request/HttpClient";

interface UploadImageState {
  httpUrl: string;
  blobUrl: string;
  uploadStatus: UploadStatus | null;
  uploadPercentage: number;
}

const uploadWarning = (message: string) => {
  ElNotification.warning({
    title: "提示",
    message,
    duration: 1500,
  });
};

export const DEFAULT_IMAGE_ACCEPT = "image/gif, image/jpeg, image/png";

export const useDoainUpload = () => {
  const CONFIG = getDoainClientConfig();
  const formDataProp = useProp<Record<string, any>>("formData", {});
  const uploadNameProp = useProp<string>("name");
  const maxSizeProp = useProp<number>("maxSize", 2);
  const imageAcceptProp = useProp<string>("accept", DEFAULT_IMAGE_ACCEPT);
  const modelValueProp = useProp<string>("modelValue", "");

  // state
  // 这里不能引入 InstanceType<typeof ElUpload>，因为这个类型是在运行时才会生成的
  const elUploadRef = ref<any>(null);
  const imageState = reactive<UploadImageState>({
    httpUrl: "",
    blobUrl: "",
    uploadStatus: null,
    uploadPercentage: 0,
  });

  watch(
    modelValueProp,
    (val) => {
      if (val) {
        imageState.httpUrl = val;
        imageState.uploadStatus = "success";
        imageState.uploadPercentage = 100;
        imageState.blobUrl = "";
      }
    },
    {
      immediate: true,
    },
  );

  // methods
  /**
   * 图片上传失败后清除文件
   */
  const clearFiles = () => {
    elUploadRef.value?.clearFiles();
    if (imageState.blobUrl) {
      URL.revokeObjectURL(imageState.blobUrl);
      imageState.blobUrl = "";
    }
  };

  const beforeUpload: UploadHooks["beforeUpload"] = (rawFile) => {
    const fileAccept = imageAcceptProp.value!.split(",").map((item) => item.trim());

    if (!fileAccept.includes(rawFile.type)) {
      uploadWarning(`不支持上传 ${rawFile.type.split("/")[1] || rawFile.type} 类型的文件`);

      elUploadRef.value?.clearFiles();
      return false;
    }

    if (rawFile.size > maxSizeProp.value! * 1024 * 1024) {
      ElNotification.warning({
        title: "提示",
        message: `上传文件大小不能超过 ${maxSizeProp.value}MB!`,
        duration: 1500,
      });
      return false;
    }

    return true;
  };

  const httpRequest: UploadRequestHandler = (params: UploadRequestOptions) => {
    if (!CONFIG.component?.upload?.url) {
      return Promise.reject(new Error("请配置上传地址: 'component.upload.url'"));
    }

    const formData = new FormData();
    Object.keys(formDataProp.value!).forEach((key) => {
      const propValue = formDataProp.value![key];
      if (propValue === undefined) return;
      formData.append(key, formDataProp.value![key]);
    });
    formData.append(uploadNameProp.value!, params.file);

    return httpClient
      .request({
        url: CONFIG.component.upload.url!,
        method: "post",
        onUploadProgress: (e) => {
          const complete = (Number(e.loaded) / Number(e.total)) * 100;
          params.onProgress({ ...e, percent: complete });
        },
      })
      .then((res) => {
        const { error, data } = res;
        if (error) {
          params.onError(error as any);
          return "";
        }
        return CONFIG.component?.upload?.transformImageUrl?.(data);
      })
      .catch((e: any) => {
        params.onError(e);
      });
  };

  /**
   * @param response `httpRequest` 执行成功后resolve的值
   * @param uploadFile 上传的文件
   */
  const onSuccess: UploadHooks["onSuccess"] = (response: string) => {
    clearFiles();
    // 图片的加载是异步的，所以这里需要先设置一个临时的url，等图片加载完成后再设置真实的url
    imageState.httpUrl = imageState.blobUrl;
    const image = new Image();
    image.src = response;
    image.onload = () => {
      imageState.httpUrl = response;
    };
  };

  const onError: UploadHooks["onError"] = (error: any) => {
    clearFiles();
    console.log(error);
  };

  /**
   * 文件状态改变时
   */
  const onChange: UploadHooks["onChange"] = (uploadFile) => {
    imageState.uploadStatus = uploadFile.status;
    imageState.uploadPercentage = uploadFile.percentage || 0;

    if (uploadFile.status === "ready") {
      imageState.blobUrl = URL.createObjectURL(uploadFile.raw!);
    }
  };

  return {
    // states
    elUploadRef,
    imageState,
    // methods
    beforeUpload,
    httpRequest,
    onSuccess,
    onError,
    onChange,
  };
};

export const useDoainUploadAction = (imageState: UploadImageState) => {
  const onDelete = () => {
    imageState.httpUrl = "";
    imageState.uploadStatus = null;
    imageState.uploadPercentage = 0;
  };

  const onPreview = () => {
    const el = document.querySelector(".doain-upload-root .doain-upload-http-image img");
    if (el) {
      // 模仿点击el-image的效果，打开图片预览
      (el as HTMLElement).click();
    }
  };

  return {
    onDelete,
    onPreview,
  };
};
