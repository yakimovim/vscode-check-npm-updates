# Check Updates of NPM Packages

Visual Studio Code extensions that check if all packages in `dependencies` and `devDependencies` sections of your `package.json` files are up to date. The extension makes this check in the background and shows notifications if updates are required. The check will be repeated after a predefined interval.

## Features

The extension is activated every time you open a new workspace. It looks for `package.json` files in all subfolders of the folders of workspaces. But `node_modules` folders are excluded from the search. Also, you can run it at any moment using a keyboard shortcut.

You can change number of simultaneously displayed notifications by adjusting `checkNpmUpdates.maximumNumberOfNotification` configuration setting. A negative value means that all notifications will be displayed.

If there are many NPM packages in your projects, one should not try to obtain information about available versions of all of them simultaneously. NPM registry will reject some of these requests as there are too many of them. This is why the extension tries to get this information sequentially by batches. You can configure the size of a batch (number of simultaneous requests) by adjusting `checkNpmUpdates.numberOfSimultaneousRequests` configuration setting. The bigger the number, the faster you'll get information about all the packages. But at the same time, the bigger the probability that some requests will be rejected. The extension has a mechanism to repeat rejected requests several times, but it will take additional time. Be careful.

The extension will repeat check of newer available versions of the NPM packages after the predefined period. You can set this period by adjusting `checkNpmUpdates.numberOfSecondsBeforeRepeat` configuration setting. If you set zero or a negative number for this setting, then checks will not be repeated automatically. In this case, you'll still be able to execute the check using the keyboard shortcut.

## Keyboard Shortcuts

The extension registers keyboard shortcut `checkNpmUpdates.checkUpdates` to execute checking immediately. Default shortcut is `Shift-Ctrl-C` (`Shift-Cmd-C` for Mac).

## Configuration File

You may place a file with name `.checkNpmUpdates.json` into a folder where `package.json` exists. The content of this file allows you to control how packages in the `package.json` will be checked.

The `.checkNpmUpdates.json` must contain JSON object with the following properties:

* disable (optional). Boolean. The default value is `false`. Its value indicates if the check of package versions should be executed for the `package.json` or not.
* skip (optional). An array of strings. The default value is an empty array. The array contains names of packages that should be excluded from the check. Names are case-insensitive.

```
{
    "disable": false,
    "skip": [
        "typescript"
    ]
}
```

## Issues and Contributing

If you have found a bug or you want to suggest some improvements, create a pull request or an issue at [GitHub](https://github.com/yakimovim/vscode-check-npm-updates).

## Release Notes

### 1.4.0

Support of configuration file for each workspace folder.

### 1.3.1

Fix of security vulnerabilities in used NPM packages.

### 1.3.0

The check of available updates will be repeated after the preconfigured period of time.

### 1.2.0

Get information about available versions of NPM packages in configurable batches.

### 1.1.3

* Configuration setting to set the number of simultaneously displayed notifications.
* Prevent from running several checks at the same time.

### 1.1.2

Improve searching of `package.json` files in many folders to find them faster.

### 1.1.1

Request for available package versions is made only once even if the same package is used in different `package.json` files in many folders.

### 1.1.0

The extension looks for `package.json` files in all subfolders of the folder of a workspace. But `node_modules` folders are excluded from the search.

### 1.0.0

The extension only checks presence `package.json` in the folder of a workspace.

## Release Notes

This software is released under [MIT License](https://raw.githubusercontent.com/yakimovim/vscode-check-npm-updates/master/LICENSE)