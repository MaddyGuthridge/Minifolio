export type ToastItem = {
  title: string,
  message: string,
  id: number,
  color: string,
};

const toastColors = {
  info: '#DDDDDD',
  error: '#FFAEAE',
} as const;

let idCounter = 0;

export const toasts: ToastItem[] = $state([]);

function removeToast(toastId: number) {
  const index = toasts.findIndex(toast => toast.id === toastId);
  if (index !== -1) {
    toasts.splice(index, 1);
  }
}

export type ToastOptions = {
  timeout: number,
  kind: keyof typeof toastColors,
};

const defaultOptions: ToastOptions = {
  timeout: 5000,
  kind: 'info',
};

/** Add a toast to the list */
export function addToast(
  title: string,
  message: string,
  toastOptions: Partial<ToastOptions> = {},
) {
  const options = { ...defaultOptions, ...toastOptions };
  const id = idCounter++;
  toasts.push({ title, message, color: toastColors[options.kind], id });
  const removeFn = () => removeToast(id);
  setTimeout(removeFn, options.timeout);
  return removeFn;
}
