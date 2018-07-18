// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const path = require('path');

const fileFunctions = require('./fileFunctions');
const packageVersions = require('./packageVersions');
const notifications = require('./notifications');
const config = require('./config');
const logger = require('./logger');
const Repeater = require("./repeater");
const SingleExecution = require("./single-execution");
const PackageVersionsRetriever = require("./package-versions-retriever").AvailablePackageVersionsRetriever;

logger.logInfo('Extension module is loaded');

async function checkNpmUpdatesInPackageFile(packageVersionsRetriever, packageFilePath) {
    const folderPath = path.dirname(packageFilePath);
    const packageLockFilePath = path.join(folderPath, "package-lock.json");
    logger.logInfo(`Checking for available updates in ${packageFilePath}`);

    try {
        const packageFileContent = await fileFunctions.readFileAsync(packageFilePath, { encoding: 'utf8' })

        const packageFileJson = JSON.parse(packageFileContent)

        const packageLockFileContent = await fileFunctions.readFileAsync(packageLockFilePath, { encoding: 'utf8' })

        const packageLockFileJson = JSON.parse(packageLockFileContent);

        const configuration = await config.getConfiguration(folderPath);

        const projectData = {
            currentFolder: folderPath,
            packageFileJson: packageFileJson,
            packageLockFileJson: packageLockFileJson,
            configuration: configuration
        }

        const packages = packageVersions.extractCurrentPackageVersions(projectData);

        const projectPackages = {
            currentFolder: projectData.currentFolder,
            packages: packages
        }

        await packageVersionsRetriever.collectAvailableVersions(projectPackages.packages)

        const packagesToUpdate = packageVersions.getRequiredUpdates(projectPackages.packages);
        notifications.displayNotification(projectPackages.currentFolder, packagesToUpdate);
    } catch (error) {
        logger.logError(error);
    }
}

function checkNpmUpdatesForAllWorkspaces() {
    const packageVersionsRetriever = new PackageVersionsRetriever();
    notifications.resetNumberOfDisplayedNotifications();

    return Promise.all(vscode.workspace.workspaceFolders.map(folder => {
        const folderPath = folder.uri.fsPath;
        logger.logInfo(`Looking for package files in ${folderPath}`);

        return fileFunctions.findPackageFiles(folderPath)
            .then(files => {
                return Promise.all(files.map(packageFilePath => {
                    return checkNpmUpdatesInPackageFile(packageVersionsRetriever, packageFilePath);
                }));
            })
            .catch(err => { logger.logError(err); });
    }));
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    const singleExecution = new SingleExecution(
        () => {
            return checkNpmUpdatesForAllWorkspaces();
        },
        () => {
            vscode.window.showInformationMessage('Check for updates of NPM packages is already executing. Please wait.');
        }
    );

    const repeater = new Repeater(
        () => {
            return singleExecution.execute();
        },
        () => {
            return vscode.workspace.getConfiguration("checkNpmUpdates")["numberOfSecondsBeforeRepeat"];
        }
    );
    context.subscriptions.push(repeater);

    repeater.execute();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('checkNpmUpdates.checkUpdates', function () {
        repeater.execute();
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;