// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path');

const fileFunctions = require('./fileFunctions');
const packageVersions = require('./packageVersions');
const logger = require('./logger');

logger.logInfo('Extension module is loaded');

function checkNpmUpdatesInPackageFile(packageFilePath) {
    const folderPath = path.dirname(packageFilePath);
    const packageLockFilePath = path.join(folderPath, "package-lock.json");
    logger.logInfo(`Checking for available updates in ${packageFilePath}`);

    fileFunctions.readFileAsync(packageFilePath, { encoding: 'utf8' })
    .then(packageFileContent => {
        return JSON.parse(packageFileContent);
    })
    .then(packageFileJson => {
        return fileFunctions.readFileAsync(packageLockFilePath, { encoding: 'utf8' })
            .then(packageLockFileContent => {
                const packageLockFileJson = JSON.parse(packageLockFileContent);
                return {
                    currentFolder: folderPath,
                    packageFileJson: packageFileJson,
                    packageLockFileJson: packageLockFileJson
                }
            })
    })
    .then(data => {
        const packages = packageVersions.extractCurrentPackageVersions(data);
        return {
            currentFolder: data.currentFolder,
            packages: packages
        }
    })
    .then(data => {
        const packages = data.packages;
        return packageVersions.collectAvailableVersions(packages)
            .then(() => { 
                return {
                    currentFolder: data.currentFolder,
                    packages: packages
                }
            })
    })
    .then(data => {
        const packagesToUpdate = packageVersions.getRequiredUpdates(data.packages);
        if(packagesToUpdate.length === 0) {
            return;
        } else if(packagesToUpdate.length === 1) {
            vscode.window.showInformationMessage(`There is a newer version of the '${packagesToUpdate[0]}' package in the '${data.currentFolder}' folder. Execute 'npm update'.`);
        } else {
            vscode.window.showInformationMessage(`There are newer versions of packages in the '${data.currentFolder}' folder. Execute 'npm update'.`);
        }
    })
    .catch(err => { logger.logError(err); })
}

function checkNpmUpdatesForAllWorkspaces() {
    packageVersions.clearCacheOfPackageVersions();

    vscode.workspace.workspaceFolders.map(folder => {
        const folderPath = folder.uri.fsPath;
        logger.logInfo(`Looking for package files in ${folderPath}`);

        fileFunctions.findPackageFiles(folderPath)
            .then(files => {
                files.forEach(packageFilePath => {
                    checkNpmUpdatesInPackageFile(packageFilePath);
                });
            })
            .catch(err => { logger.logError(err); });
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    checkNpmUpdatesForAllWorkspaces();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('checkNpmUpdates.checkUpdates', function () {
        checkNpmUpdatesForAllWorkspaces();
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;