export type ToastItem = {
  title: string;
  message: string;
  id: number;
};

let idCounter = 0;

export const toasts: ToastItem[] = $state([]);

function removeToast(toastId: number) {
  const index = toasts.findIndex(toast => toast.id === toastId);
  if (index !== -1) {
    toasts.splice(index, 1);
  }
}

/** Add a toast to the list */
export function addToast(title: string, message: string, timeout: number) {
  const id = idCounter++;
  toasts.push({ title, message, id });
  const removeFn = () => removeToast(id);
  setTimeout(removeFn, timeout);
  return removeFn;
}
