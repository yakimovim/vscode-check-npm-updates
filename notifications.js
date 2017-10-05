const vscode = require('vscode');

let numberOfDisplayedNotifications = 0;

function resetNumberOfDisplayedNotifications() {
    numberOfDisplayedNotifications = 0;
}

exports.resetNumberOfDisplayedNotifications = resetNumberOfDisplayedNotifications;

function displayNotification(currentFolder, packagesToUpdate) {
    if(packagesToUpdate.length === 0) {
        return;
    }

    var maximumNumberOfNotification = vscode.workspace.getConfiguration("checkNpmUpdates")["maximumNumberOfNotification"];
    if(maximumNumberOfNotification >= 0) {
        if(numberOfDisplayedNotifications >= maximumNumberOfNotification) {
            return;
        }
        numberOfDisplayedNotifications++;
    }

    if(packagesToUpdate.length === 1) {
        vscode.window.showInformationMessage(`There is a newer version of the '${packagesToUpdate[0]}' package in the '${currentFolder}' folder. Execute 'npm update'.`);
    } else {
        vscode.window.showInformationMessage(`There are newer versions of packages in the '${currentFolder}' folder. Execute 'npm update'.`);
    }
}

exports.displayNotification = displayNotification;