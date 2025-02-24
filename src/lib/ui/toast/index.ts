import ToastDisplay from './ToastDisplay.svelte';
import { addToast } from './toastManager.svelte';
export { addToast } from './toastManager.svelte';

export { ToastDisplay };

type ErrorReporterOptions = {
  handleError: boolean,
};

const defaultOptions: ErrorReporterOptions = {
  handleError: true,
};

export function showError(title: string, e: any) {
  addToast(title, `${e}`, { kind: 'error' });
}

export async function reportError<T>(
  fn: () => Promise<T>,
  title: string,
  reporterOptions: Partial<ErrorReporterOptions> = {},
): Promise<T | undefined> {
  const options = { ...defaultOptions, ...reporterOptions };
  try {
    return await fn();
  } catch (e) {
    showError(title, e);
    if (!options.handleError) {
      throw e;
    }
    return undefined;
  }
}
