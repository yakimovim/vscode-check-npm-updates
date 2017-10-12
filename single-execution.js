const logger = require("./logger");

class SingleExecution {
    constructor(functionReturningPromise, onAlreadyExecuting) {
        if(!functionReturningPromise) {
            throw new Error("Function returning promise should be defined.");
        }

        this._func = functionReturningPromise;
        this._onAlreadyExecuting = onAlreadyExecuting;
        this._isExecuting = false;

        logger.logInfo("SingleExecution created");
    }

    execute() {
        if(this._isExecuting) {
            if(!!this._onAlreadyExecuting) {
                this._onAlreadyExecuting();
            }
            return Promise.resolve();
        }

        logger.logInfo("Executing single instance of function...");

        this._isExecuting = true;

        return this._func()
            .then(() => {
                logger.logInfo("Executing of single instance of function is finished.");
                this._isExecuting = false;
            });
    }
}

exports.SingleExecution = SingleExecution;