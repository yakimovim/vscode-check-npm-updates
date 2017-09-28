const exec = require('child_process').exec;
const semver = require('semver');

function getAvailablePackageVersions(packageName) {
    return new Promise((resolve, reject) => {
        exec(`npm show ${packageName} versions --json`, (error, stdout, stderr) => {
            if(error) {
                reject(error);
                return;
            }

            if(stderr) {
                reject(stderr);
                return;
            }

            resolve(stdout);
        })
    });
}

function extractCurrentPackageVersions({ packageFileJson, packageLockFileJson }) {

    function collectRequiredPackages(dependencies, packages)
    {
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
        return getAvailablePackageVersions(packageInfo.packageName)
            .then(result => {
                return JSON.parse(result);
            })
            .then(versionsJson => {
                currentPackageInfo.availableVersions = versionsJson;
            })
            .catch(_ => {});
    }));
}

exports.collectAvailableVersions = collectAvailableVersions;

function updateRequired(packageInfo) {
    if(!packageInfo.availableVersions) {
        return false;
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