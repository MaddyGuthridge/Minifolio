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

export async function reportError<T>(
  fn: () => Promise<T>,
  title: string,
  reporterOptions: Partial<ErrorReporterOptions> = {},
): Promise<T | undefined> {
  const options = { ...defaultOptions, ...reporterOptions };
  try {
    return await fn();
  } catch (e) {
    addToast(title, `${e}`, { kind: 'error' });
    if (!options.handleError) {
      throw e;
    }
    return undefined;
  }
}
