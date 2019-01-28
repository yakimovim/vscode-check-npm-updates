import { Deferred } from "./deferred";
import * as logger from "./logger";

interface IRequest {
  request: (def: Deferred) => any;
  deferred: Deferred;
}

/**
 * Executes requests one after another.
 * It waits one request to finish before
 * execution of the next request.
 */
export class SequentialExecutor {
  private _queryOfRequests: IRequest[];

  constructor() {
    this._queryOfRequests = [];
  }

  public executeRequest<T>(request: (def: Deferred) => any): Promise<T> {
    const deferred = new Deferred();
    const resultPromise = deferred.getPromise();
    resultPromise.then(
      () => this._executeNextRequestFromQuery(),
      () => this._executeNextRequestFromQuery()
    );

    this._queryOfRequests.push({
      request,
      deferred
    });

    if (this._queryOfRequests.length === 1) {
      this._executeNextRequestFromQuery();
    }

    return resultPromise;
  }

  private _executeNextRequestFromQuery() {
    if (this._queryOfRequests.length === 0) {
      return;
    }

    logger.logInfo("Executing sequential request...");

    const item = this._queryOfRequests[0];

    item.request(item.deferred);

    this._queryOfRequests.splice(0, 1);
  }
}
