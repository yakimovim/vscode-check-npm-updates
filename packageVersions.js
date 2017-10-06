const exec = require('child_process').exec;
const semver = require('semver');
const logger = require('./logger');

let packageVersionsCache = {};

function clearCacheOfPackageVersions() {
    packageVersionsCache = {};
}

exports.clearCacheOfPackageVersions = clearCacheOfPackageVersions;

function getAvailablePackageVersions(packageName) {
    return new Promise((resolve, reject) => {
        logger.logInfo(`Getting available package versions for ${packageName}...`);

        exec(`npm show ${packageName} versions --json`, (error, stdout, stderr) => {
            if(error) {
                logger.logError(`Unable to get available package versions for ${packageName}`);
                reject(error);
                return;
            }

            if(stderr) {
                logger.logError(`Unable to get available package versions for ${packageName}`);
                reject(stderr);
                return;
            }

            resolve(JSON.parse(stdout));
        })
    });
}

function getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats) {
    return getAvailablePackageVersions(packageName)
        .catch(err => {
            if(numberOfRepeats > 0) {
                logger.logInfo(`Repeating getting available versions for ${packageName}. ${numberOfRepeats} repeats left.`);
                return getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats - 1);
            }
            throw new Error(err);
        })
}

function getAvailablePackageVersionsWithRepeatAndCaching(packageName, numberOfRepeats) {
    if(!packageVersionsCache[packageName]) {
        var promiseToGetVersions = getAvailablePackageVersionsWithRepeat(packageName, numberOfRepeats);
        packageVersionsCache[packageName] = promiseToGetVersions;
    }
    return packageVersionsCache[packageName];
}

function extractCurrentPackageVersions({ packageFileJson, packageLockFileJson }) {

    function collectRequiredPackages(dependencies, packages) {
        if(dependencies) {
            for(var packageName in dependencies) {
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
            if(installedPackageInfo) {
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

function collectAvailableVersions(packages) {
    return Promise.all(packages.map(packageInfo => {
        const currentPackageInfo = packageInfo;
        return getAvailablePackageVersionsWithRepeatAndCaching(packageInfo.packageName, 5)
            .then(versionsJson => {
                currentPackageInfo.availableVersions = versionsJson;
            })
            .catch(err => { logger.logError(err); });
    }));
}

exports.collectAvailableVersions = collectAvailableVersions;

function updateRequired(packageInfo) {
    if(!packageInfo.availableVersions) {
        return false;
    }

    if(!packageInfo.installedVersion) {
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
        if(updateRequired(packageInfo)) {
            packagesToUpdate.push(packageInfo.packageName);
        }
    });

    return packagesToUpdate;
}

exports.getRequiredUpdates = getRequiredUpdates;