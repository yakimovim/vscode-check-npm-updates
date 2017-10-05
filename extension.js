// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path');

const fileFunctions = require('./fileFunctions');
const packageVersions = require('./packageVersions');
const notifications = require('./notifications');
const logger = require('./logger');

logger.logInfo('Extension module is loaded');

let checkIsExecuting = false;

function checkNpmUpdatesInPackageFile(packageFilePath) {
    const folderPath = path.dirname(packageFilePath);
    const packageLockFilePath = path.join(folderPath, "package-lock.json");
    logger.logInfo(`Checking for available updates in ${packageFilePath}`);

    return fileFunctions.readFileAsync(packageFilePath, { encoding: 'utf8' })
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
        notifications.displayNotification(data.currentFolder, packagesToUpdate);
    })
    .catch(err => { logger.logError(err); })
}

function checkNpmUpdatesForAllWorkspaces() {
    if(checkIsExecuting) {
        vscode.window.showInformationMessage('Check for updates of NPM packages is already executing. Please wait.');
        return;
    }

    checkIsExecuting = true;

    packageVersions.clearCacheOfPackageVersions();
    notifications.resetNumberOfDisplayedNotifications();

    Promise.all(vscode.workspace.workspaceFolders.map(folder => {
        const folderPath = folder.uri.fsPath;
        logger.logInfo(`Looking for package files in ${folderPath}`);

        return fileFunctions.findPackageFiles(folderPath)
            .then(files => {
                return Promise.all(files.map(packageFilePath => {
                    return checkNpmUpdatesInPackageFile(packageFilePath);
                }));
            })
            .catch(err => { logger.logError(err); });
    }))
    .then(() => {
        checkIsExecuting = false;
    })
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