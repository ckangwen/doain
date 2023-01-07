import { PlainObject } from "@effective/shared";
import { DialogProps, ElDialog } from "element-plus";
import { VNode, h, ref } from "vue";

type CreateElDialogOptions = Partial<Omit<DialogProps, "modelValue">>;
const elDialogDefaultProps: CreateElDialogOptions = {
  appendToBody: false,
  destroyOnClose: false,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  lockScroll: true,
  modal: true,
  openDelay: 0,
  closeDelay: 0,
  trapFocus: false,
};

type CreateElDialogEvents = Partial<{
  onOpen: () => void;
  opOpened: () => void;
  onClose: () => () => void;
  onOpenAutoFocus: () => () => void;
  onCloseAutoFocus: () => () => void;
}>;

export const createDialog = (
  NestedComponent: any,
  dialogProps: CreateElDialogOptions = elDialogDefaultProps,
  dialogEvents: CreateElDialogEvents = {},
): [
  () => VNode,
  {
    toggle: () => void;
    open: (data?: PlainObject) => void;
    close: () => void;
  },
] => {
  const dialogPropsWithDefaults = Object.assign(elDialogDefaultProps, dialogProps);
  const visible = ref(false);

  const extraData = ref<PlainObject>({});
  const toggle = () => {
    visible.value = !visible.value;
  };
  const open = (data?: PlainObject) => {
    visible.value = true;
    if (data) {
      extraData.value = data;
    }
  };
  const close = () => {
    visible.value = false;
    extraData.value = {};
  };

  const DialogComponent = () =>
    h(
      ElDialog,
      {
        modelValue: visible.value,
        ...dialogPropsWithDefaults,
        ...dialogEvents,
        onClose: () => {
          dialogEvents.onClose?.();
          close();
        },
      },
      {
        default: () => h(NestedComponent, { ...extraData.value }),
      },
    );

  return [
    DialogComponent,
    {
      toggle,
      open,
      close,
    },
  ];
};
