import * as vscode from "vscode";
import { PackageManager } from "./package-versions";

let numberOfDisplayedNotifications = 0;

export function resetNumberOfDisplayedNotifications(): void {
  numberOfDisplayedNotifications = 0;
}

export function maximumNumberOfNotificationIsNotExceeded(
  numberOfDisplayedNotifications: number,
  maximumNumberOfNotification: number
): boolean {
  if (maximumNumberOfNotification < 0) {
    return true;
  }

  return numberOfDisplayedNotifications < maximumNumberOfNotification;
}

export function displayUpdateNotification(
  packageManager: PackageManager,
  currentFolder: string,
  packagesToUpdate: string[]
): void {
  if (packagesToUpdate.length === 0) {
    return;
  }

  const maximumNumberOfNotification = vscode.workspace.getConfiguration(
    "checkNpmUpdates"
  )["maximumNumberOfNotification"];
  if (
    maximumNumberOfNotificationIsNotExceeded(
      numberOfDisplayedNotifications,
      maximumNumberOfNotification
    )
  ) {
    numberOfDisplayedNotifications++;

    if (packagesToUpdate.length === 1) {
      vscode.window.showInformationMessage(
        `There is a newer version of the '${
          packagesToUpdate[0]
        }' package in the '${currentFolder}' folder. Execute '${getUpdateCommand(
          packageManager
        )}'.`
      );
    } else {
      vscode.window.showInformationMessage(
        `There are newer versions of packages in the '${currentFolder}' folder. Execute '${getUpdateCommand(
          packageManager
        )}'.`
      );
    }
  }
}

function getUpdateCommand(packageManager: PackageManager): string {
  if (packageManager === PackageManager.Yarn) {
    return "yarn upgrade";
  }

  return "npm update";
}

export function displayAuditNotification(
  packageManager: PackageManager,
  currentFolder: string
): void {
  const maximumNumberOfNotification = vscode.workspace.getConfiguration(
    "checkNpmUpdates"
  )["maximumNumberOfNotification"];
  if (
    maximumNumberOfNotificationIsNotExceeded(
      numberOfDisplayedNotifications,
      maximumNumberOfNotification
    )
  ) {
    numberOfDisplayedNotifications++;

    vscode.window.showErrorMessage(
      `There are security problems with packages in the '${currentFolder}' folder. Execute '${getAuditCommand(
        packageManager
      )}'.`
    );
  }
}

function getAuditCommand(packageManager: PackageManager): string {
  if (packageManager === PackageManager.Yarn) {
    return "yarn audit";
  }

  return "npm audit";
}
