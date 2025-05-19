/**
 * Determine information about the machine we are running on.
 */
import { fileExists } from './util';

/** Return whether the app is running in docker */
export function runningInDocker() {
  return fileExists('/.dockerenv');
}
