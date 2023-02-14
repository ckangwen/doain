import { Delete, Plus, ZoomIn } from "@element-plus/icons-vue";
import { ElIcon, ElImage, ElProgress, ElUpload } from "element-plus";
import { computed, defineComponent, h } from "vue";

import { DEFAULT_IMAGE_ACCEPT, useDoainUpload, useDoainUploadAction } from "./useUpload";

export const DUpload = defineComponent({
  name: "DUpload",
  props: {
    modelValue: { type: String, default: "" },
    height: { type: Number, default: 148 },
    width: { type: Number, default: 148 },
    tip: { type: String, default: "点击上传" },
    action: { type: String, default: "" },
    formData: { type: Object, default: () => {} },
    name: { type: String, default: "" },
    accept: { type: String, default: DEFAULT_IMAGE_ACCEPT },
    maxSize: { type: Number, default: 2 },
    limit: { type: Number, default: 1 },
    autoUpload: { type: Boolean, default: true },
    showFileList: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    useDefaultStyle: { type: Boolean, default: true },
  },
  setup(props) {
    const rootStyle = computed(() => {
      return {
        height: `${props.height}px`,
        width: `${props.width}px`,
      };
    });
    const {
      // states
      elUploadRef,
      imageState,
      // methods
      beforeUpload,
      httpRequest,
      onSuccess,
      onChange,
      onError,
    } = useDoainUpload();

    const { onDelete, onPreview } = useDoainUploadAction(imageState);

    return {
      // states
      rootStyle,
      elUploadRef,
      imageState,
      // methods
      beforeUpload,
      httpRequest,
      onSuccess,
      onChange,
      onError,
      onDelete,
      onPreview,
    };
  },
  render() {
    const renderProgress = (visible: boolean) =>
      h(
        "div",
        {
          class: "doain-upload-uploading",
          style: {
            display: visible ? undefined : "none",
            "--image": this.imageState.blobUrl ? `url(${this.imageState.blobUrl})` : "inherit",
            "--filter": this.imageState.blobUrl ? "5px" : 0,
          },
        },
        [
          h(
            "div",
            {
              class: "doain-upload-uploading__progress",
            },
            [
              h(ElProgress, {
                percentage: this.imageState.uploadPercentage,
                textInside: true,
                strokeWidth: 4,
              }),
            ],
          ),
          h(ElImage, {
            class: "doain-upload-blob-image",
            src: this.imageState.blobUrl,
            fit: "cover",
          }),
        ],
      );

    const renderImage = (visible: boolean) =>
      h(
        "div",
        {
          class: "doain-upload-image-container",
          style: {
            display: visible ? undefined : "none",
          },
        },
        [
          h(ElImage, {
            class: "doain-upload-http-image",
            src: this.imageState.httpUrl,
            previewSrcList: [this.imageState.httpUrl],
            fit: "cover",
            hideOnClickModal: true,
            zIndex: 100,
          }),
        ],
      );

    const renderUpload = (visible: boolean) =>
      h(
        ElUpload,
        {
          class: "doain-upload-el",
          style: {
            display: visible ? undefined : "none",
          },
          ref: "elUploadRef",
          autoUpload: this.autoUpload,
          disabled: this.disabled,
          showFileList: this.showFileList,
          action: this.action,
          data: this.formData,
          name: this.name,
          accept: this.accept,
          limit: this.limit,
          httpRequest: this.httpRequest,
          beforeUpload: this.beforeUpload,
          onChange: this.onChange,
          onSuccess: this.onSuccess,
          onError: this.onError,
        },
        {
          default: this.$slots.default
            ? this.$slots.default
            : () => {
                return h(
                  "div",
                  {
                    class: "doain-upload-placeholder",
                  },
                  [
                    h(
                      ElIcon,
                      {},
                      {
                        default: () => h(Plus),
                      },
                    ),
                    h(
                      "span",
                      {
                        class: "doain-upload-placeholder__text",
                      },
                      "点击上传",
                    ),
                  ],
                );
              },
        },
      );

    const renderActions = (visible: boolean) => {
      return h(
        "div",
        {
          class: "doain-upload-actions",
          style: {
            display: visible ? undefined : "none",
          },
        },
        [
          h(
            "span",
            {
              class: "doain-upload-actions__preview",
              onClick: this.onPreview,
            },
            [
              h(
                ElIcon,
                {},
                {
                  default: () => h(ZoomIn),
                },
              ),
            ],
          ),
          h(
            "span",
            {
              class: "doain-upload-actions__delete",
              onClick: this.onDelete,
            },
            [
              h(
                ElIcon,
                {},
                {
                  default: () => h(Delete),
                },
              ),
            ],
          ),
        ],
      );
    };

    return h(
      "div",
      {
        class: `doain-upload-root ${this.useDefaultStyle ? "doain-upload-root--default" : ""}`,
        style: this.rootStyle,
      },
      [
        renderProgress(Boolean(this.imageState.uploadStatus === "uploading")),
        renderImage(Boolean(this.imageState.uploadStatus === "success")),
        renderActions(Boolean(this.imageState.uploadStatus === "success") && !this.disabled),
        renderUpload(this.imageState.uploadStatus === null),
      ],
    );
  },
});
