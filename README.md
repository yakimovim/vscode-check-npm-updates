# Check Updates of NPM Packages

Visual Studio Code extensions that checks if all packages in `dependencies` and `devDependencies` sections of your `package.json` files are up to date. The extension makes this check in background and shows notifications if updates are required.

## Features

The extension is activated every time you open new workspace. It looks for `package.json` files in all subfolders of the folders of workspaces. But `node_modules` folders are excluded from the search. Also you can run it at any moment using keyboard shortcut.

You can change number of simultaneously displayed notifications by adjusting `checkNpmUpdates.maximumNumberOfNotification` configuration setting. Negative value means that all notifications will be displayed.

If there are many NPM packages in your projects, one should not try to obtain information about available versions of all of them simultaneously. NPM registry will reject some of these requests as there are too many of them. This is why the extension tries to get this information sequentially by batches. You can configure size of a batch (number of simultaneous requests) by adjusting `checkNpmUpdates.numberOfSimultaneousRequests` configuration setting. The bigger the number, the faster you'll get information about all packages. But at the same time, the bigger probability that some requests will be rejected. The extension has mechanism to repeat rejected requests several times, but it will take additional time. Be careful.

## Keyboard Shortcuts

The extension registers keyboard shortcut `checkNpmUpdates.checkUpdates` to execute checking immediately. Default shortcut is `Shift-Ctrl-C` (`Shift-Cmd-C` for Mac).

## Issues and Contributing

If you have found a bug or you want to suggest some improvements, create a pull request or an issue at [GitHub](https://github.com/yakimovim/vscode-check-npm-updates).

## Release Notes

### 1.2.0

Get information about available versions of NPM packages in configurable batches.

### 1.1.3

* Configuration setting to set number of simultaneously displayed notifications.
* Prevent from running several checks at the same time.

### 1.1.2

Improve searching of `package.json` files in many folders to find them faster.

### 1.1.1

Request for available package versions is made only once even if the same package is used in different `package.json` files in many folders.

### 1.1.0

The extension looks for `package.json` files in all subfolders of the folder of workspace. But `node_modules` folders are excluded from the search.

### 1.0.0

The extension only checks presence `package.json` in the folder of workspace.

## Release Notes

This software is released under [MIT License](https://raw.githubusercontent.com/yakimovim/vscode-check-npm-updates/master/LICENSE)