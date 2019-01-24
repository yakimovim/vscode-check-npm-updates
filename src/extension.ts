"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as fileFunctions from "./file-functions";
import * as notifications from "./notifications";
import * as logger from "./logger";
import { Repeater } from "./repeater";
import { SingleExecution } from "./single-execution";
import { OutdatedPackagesRetriever } from "./package-versions-retriever";
import { createPackagesAnalyser } from "./packages-analysers";

logger.logInfo("Extension module is loaded");

async function checkPackageUpdatesInPackageFile(
  packageVersionsRetriever: OutdatedPackagesRetriever,
  packageFilePath: string
): Promise<void> {
  logger.logInfo(`Checking for available updates in ${packageFilePath}`);

  try {
    var packageAnalyser = createPackagesAnalyser(packageVersionsRetriever, packageFilePath);
    if(packageAnalyser === null) {
      return;
    }

    await packageAnalyser.initialize();

    const packagesToUpdate = packageAnalyser.getPackagesToUpdate();

    if(packagesToUpdate.length > 0) {
      notifications.displayNotification(
        packageAnalyser.packageManager,
        packageAnalyser.folderPath,
        packagesToUpdate
      );
    }
  } catch (error) {
    logger.logError(error);
  }
}

function checkPackageUpdatesForAllWorkspaces(): Promise<any> {
  const packageVersionsRetriever = new OutdatedPackagesRetriever();
  notifications.resetNumberOfDisplayedNotifications();

  if (!vscode.workspace.workspaceFolders) {
    return Promise.resolve();
  }

  return Promise.all(
    vscode.workspace.workspaceFolders.map(folder => {
      const folderPath = folder.uri.fsPath;
      logger.logInfo(`Looking for package files in ${folderPath}`);

      return fileFunctions
        .findPackageFiles(folderPath)
        .then(files => {
          return Promise.all(
            files.map(packageFilePath => {
              return checkPackageUpdatesInPackageFile(
                packageVersionsRetriever,
                packageFilePath
              );
            })
          );
        })
        .catch(err => {
          logger.logError(err);
        });
    })
  );
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const singleExecution = new SingleExecution(
        () => {
            return checkPackageUpdatesForAllWorkspaces();
        },
        () => {
            vscode.window.showInformationMessage('Check for updates of packages is already executing. Please wait.');
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
    const disposable = vscode.commands.registerCommand('checkNpmUpdates.checkUpdates', function () {
        repeater.execute();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
