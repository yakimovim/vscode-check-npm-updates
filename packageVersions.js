const semver = require('semver');
const logger = require('./logger');

function extractCurrentPackageVersions({ packageFileJson, packageLockFileJson, configuration }) {

    function collectRequiredPackages(dependencies, packages, skip) {
        if (dependencies) {
            for (var packageName in dependencies) {
                if(!skip.includes(packageName.toLowerCase())){
                    packages.push({
                        packageName: packageName,
                        requestedVersion: dependencies[packageName]
                    });
                }
                else {
                    logger.logInfo(`Package '${packageName}' is skipped`)
                }
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

    if(!configuration.disable) {
        collectRequiredPackages(packageFileJson.dependencies, packages, configuration.skip);
        collectRequiredPackages(packageFileJson.devDependencies, packages, configuration.skip);

        setInstalledVersions(packageLockFileJson.dependencies, packages);
    }

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