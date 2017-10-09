const exec = require('child_process').exec;
const semver = require('semver');
const logger = require('./logger');

function extractCurrentPackageVersions({ packageFileJson, packageLockFileJson }) {

    function collectRequiredPackages(dependencies, packages) {
        if (dependencies) {
            for (var packageName in dependencies) {
                packages.push({
                    packageName: packageName,
                    requestedVersion: dependencies[packageName]
                });
            }
        }
    }

    function setInstalledVersions(dependencies, packages) {
        packages.forEach(packageInfo => {
            var installedPackageInfo = dependencies[packageInfo.packageName];
            if (installedPackageInfo) {
                packageInfo.installedVersion = installedPackageInfo.version;
            }
        });
    }

    const packages = [];
    collectRequiredPackages(packageFileJson.dependencies, packages);
    collectRequiredPackages(packageFileJson.devDependencies, packages);

    setInstalledVersions(packageLockFileJson.dependencies, packages);

    return packages;
}

exports.extractCurrentPackageVersions = extractCurrentPackageVersions;

function updateRequired(packageInfo) {
    if (!packageInfo.availableVersions) {
        return false;
    }

    if (!packageInfo.installedVersion) {
        return true;
    }

    const versionRange = `${packageInfo.requestedVersion} >${packageInfo.installedVersion}`;

    return packageInfo.availableVersions.some(ver => {
        return semver.satisfies(ver, versionRange);
    });
}

function getRequiredUpdates(packages) {
    const packagesToUpdate = [];

    packages.forEach(packageInfo => {
        if (updateRequired(packageInfo)) {
            packagesToUpdate.push(packageInfo.packageName);
        }
    });

    return packagesToUpdate;
}

exports.getRequiredUpdates = getRequiredUpdates;

class AvailablePackageVersionsRetriever {
    constructor() {
        this._promisesForPackages = {};
        this._queueOfPackages = [];
    }

    getAvailablePackageVersions(packageName) {
        if (!!this._promisesForPackages[packageName]) {
            return this._promisesForPackages[packageName].getPromise();
        }

        const deferred = new Deferred();
        this._promisesForPackages[packageName] = deferred;
        this._queueOfPackages.push({
            packageName: packageName,
            deferred: deferred
        });

        if (this._queueOfPackages.length === 1) {
            this._executeGettingAvailableVersions();
        }

        return this._promisesForPackages[packageName].getPromise();
    }

    _executeGettingAvailableVersions() {
        if (this._queueOfPackages.length === 0) {
            return;
        }

        const packageInfo = this._queueOfPackages[0];
        this._getAvailablePackageVersionsWithRepeat(packageInfo.packageName, 5)
            .then(versions => {
                packageInfo.deferred.resolve(versions);
            })
            .catch(err => {
                logger.logError(err);
                packageInfo.deferred.resolve([]);
            })
            .then(() => {
                this._queueOfPackages.splice(0, 1);
                this._executeGettingAvailableVersions();
            })
    }

    _getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats) {
        return this._getAvailablePackageVersions(packageName)
            .catch(err => {
                if (numberOfRepeats > 0) {
                    logger.logInfo(`Repeating getting available versions for ${packageName}. ${numberOfRepeats} repeats left.`);
                    return this._getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats - 1);
                }
                throw new Error(err);
            })
    }

    _getAvailablePackageVersions(packageName) {
        return new Promise((resolve, reject) => {
            logger.logInfo(`Getting available package versions for ${packageName}...`);

            exec(`npm show ${packageName} versions --json`, (error, stdout, stderr) => {
                if (error) {
                    logger.logError(`Unable to get available package versions for ${packageName}`);
                    reject(error);
                    return;
                }

                if (stderr) {
                    logger.logError(`Unable to get available package versions for ${packageName}`);
                    reject(stderr);
                    return;
                }

                resolve(JSON.parse(stdout));
            })
        });
    }
    
    collectAvailableVersions(packages) {
        return Promise.all(packages.map(packageInfo => {
            const currentPackageInfo = packageInfo;
            return this.getAvailablePackageVersions(packageInfo.packageName)
                .then(versionsJson => {
                    currentPackageInfo.availableVersions = versionsJson;
                })
                .catch(err => { logger.logError(err); });
        }));
    }
}

exports.AvailablePackageVersionsRetriever = AvailablePackageVersionsRetriever;

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