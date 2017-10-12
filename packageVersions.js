const semver = require('semver');

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