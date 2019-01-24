import * as logger from "./logger";

/**
 * Repeats execution of some function with given intervals.
 */
export class Repeater {
  private _func: () => Promise<any>;
  private _durationProvider: () => number;
  private _timer?: NodeJS.Timeout;
  private _isDisposed: boolean;

  constructor(
    functionReturningPromise: () => Promise<any>,
    getSecondsBeforeRepetition: () => number
  ) {
    if (!functionReturningPromise) {
      throw new Error("Function returning promise should be defined.");
    }
    if (!getSecondsBeforeRepetition) {
      throw new Error("Duration provider should be defined.");
    }

    this._func = functionReturningPromise;
    this._durationProvider = getSecondsBeforeRepetition;
    this._timer = undefined;
    this._isDisposed = false;

    logger.logInfo("Repeater created");
  }

  execute(): void {
    if (this._isDisposed) {
      return;
    }

    const that = this;

    that.cancelRepetitions();

    that
      ._func()
      .then(() => {
        that.resetTimer();
      })
      .catch(err => {
        logger.logError(`Error while executing repeating function: ${err}`);

        that.resetTimer();
      });
  }

  resetTimer(): void {
    const that = this;

    this.cancelRepetitions();

    if (this._isDisposed) {
      return;
    }

    const duration = this._durationProvider() * 1000;
    if (duration <= 0) {
      logger.logInfo("Execution will not be repeated.");
      return;
    }

    logger.logInfo(`Execution will be repeated in ${duration} ms.`);
    this._timer = setTimeout(() => {
      that.execute();
    }, duration);
  }

  cancelRepetitions(): void {
    if (!!this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  dispose(): void {
    this._isDisposed = true;

    this.cancelRepetitions();

    logger.logInfo("Repeater disposed");
  }
}
