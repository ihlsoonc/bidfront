import { Dialog } from "quasar";

export const showConfirmationDialog = ({
  title = "확인",
  message = "계속하시겠습니까?",
  okLabel = "예",
  cancelLabel = "아니오",
  persistent = true,
  onOk = () => {},
  onCancel = () => {},
}) => {
  Dialog.create({
    title: title,
    message: message,
    cancel: true,
    persistent: persistent,
    ok: { label: okLabel, color: "primary" },
    cancel: { label: cancelLabel, color: "negative" },
  })
    .onOk(onOk)
    .onCancel(onCancel);
};
