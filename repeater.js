const logger = require("./logger");

class Repeater {
    constructor(functionReturningPromise, getSecondsBeforeRepetition) {
        if (!functionReturningPromise) {
            throw new Error("Function returning promise should be defined.");
        }
        if (!getSecondsBeforeRepetition) {
            throw new Error("Duration provider should be defined.");
        }

        this._func = functionReturningPromise;
        this._durationProvider = getSecondsBeforeRepetition;
        this._timer = null;

        logger.logInfo("Repeater created");
    }

    execute() {
        if(this._isDisposed) {
            return;
        }

        const that = this;

        that.cancelRepetitions();

        that._func()
            .then(() => {
                that.resetTimer();
            })
            .catch(err => {
                logger.logError(`Error while executing repeating function: ${err}`);

                that.resetTimer();
            });
    }

    resetTimer() {
        const that = this;

        this.cancelRepetitions();

        if(this._isDisposed) {
            return;
        }

        var duration = this._durationProvider() * 1000;
        if (duration <= 0) {
            logger.logInfo("Execution will not be repeated.");
            return;
        }

        logger.logInfo(`Execution will be repeated in ${duration} ms.`);
        this._timer = setTimeout(() => { that.execute() }, duration);
    }

    cancelRepetitions() {
        if (!!this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    dispose() {
        this._isDisposed = true;
        
        this.cancelRepetitions();

        logger.logInfo("Repeater disposed");
    }
}

module.exports = Repeater;