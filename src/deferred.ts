export class Deferred {
  private _promise: Promise<any>;
  private _resolve: any;
  private _reject: any;

  constructor() {
    const that = this;
    this._promise = new Promise((resolve, reject) => {
      that._resolve = resolve;
      that._reject = reject;
    });
  }

  getPromise() {
    return this._promise;
  }

  resolve(data?: any) {
    this._resolve(data);
  }

  reject(err: any) {
    this._reject(err);
  }
}
