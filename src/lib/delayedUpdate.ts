import { Option } from './util';

/**
 * Delayed update manager. Used to stagger API calls to prevent overloading the back-end.
 */
export default class DelayedUpdater<T> {
  /** Callback, called whenever value should be committed */
  callback: (value: T) => Promise<any>;
  /** Hesitation before committing an update, in ms */
  hesitation: number;
  /** Timer, used to commit updates after `hesitation` ms */
  changeTimer: ReturnType<typeof setTimeout> | undefined;
  /** Value about to be committed (or `Option.none()` if there are no changes to be committed) */
  current: Option<T>;

  constructor (callback: (value: T) => Promise<any>, hesitation: number) {
    this.callback = callback;
    this.hesitation = hesitation;
    this.current = Option.none();
  }

  /** Callback for when the timer fires */
  __timerDone() {
    if (this.current.isSome) {
      void this.callback(this.current.value!);
      this.current = Option.none();
    }
    this.changeTimer = undefined;
  }

  /** Update the value, resetting the timer */
  update(newValue: T) {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }
    this.current = Option.some(newValue);
    this.changeTimer = setTimeout(() => this.__timerDone(), this.hesitation)
  }
  /** Immediately update the value */
  immediateUpdate(newValue: T) {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
      this.changeTimer = undefined;
    }
    this.current = Option.none();
    void this.callback(newValue);
  }
  /** Flush the current value, immediately committing it, and clearing the timer */
  commit() {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
      this.changeTimer = undefined;
    }
    this.__timerDone();
  }

  /** Cancel the timer without committing the value */
  cancel() {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
      this.changeTimer = undefined;
    }
  }
}
