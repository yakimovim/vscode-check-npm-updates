class Deferred {
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

    resolve(data) {
        this._resolve(data);
    }

    reject(err) {
        this._reject(err);
    }
}

module.exports = Deferred;