# Check Updates of NPM Packages

Visual Studio Code extensions that check if all packages in `dependencies` and `devDependencies` sections of your `package.json` files are up to date. Also the extension checks if there are any audit problems with used packages. The extension makes these checks in the background and shows notifications if updates are required or there are audit problems. The check will be repeated after a predefined interval.

Be aware, that the extension needs `package-lock.json` or `yarn.lock` files in the same folder as `package.json` file. This is how the extension distinguish Npm and Yarn projects.

## Features

The extension is activated every time you open a new workspace. It looks for `package.json` files in all subfolders of the folders of workspaces. But `node_modules` and `bower_components` folders are excluded from the search. Also, you can run it at any moment using a keyboard shortcut.

You can change number of simultaneously displayed notifications by adjusting `checkNpmUpdates.maximumNumberOfNotification` configuration setting. A negative value means that all notifications will be displayed.

The extension will repeat check of newer available versions of the NPM packages after the predefined period. You can set this period by adjusting `checkNpmUpdates.numberOfSecondsBeforeRepeat` configuration setting. If you set zero or a negative number for this setting, then checks will not be repeated automatically. In this case, you'll still be able to execute the check using the keyboard shortcut.

## Keyboard Shortcuts

The extension registers keyboard shortcut `checkNpmUpdates.checkUpdates` to execute checking immediately. Default shortcut is `Shift-Ctrl-C` (`Shift-Cmd-C` for Mac).

## Configuration File

You may place a file with name `.checkNpmUpdates.json` into a folder where `package.json` exists. The content of this file allows you to control how packages in the `package.json` will be checked.

The `.checkNpmUpdates.json` must contain JSON object with the following properties:

* **disable** (optional). Boolean. The default value is `false`. Its value indicates if the check of package versions should be executed for the `package.json` or not.
* **skip** (optional). An array of strings. The default value is an empty array. The array contains names of packages that should be excluded from the check. Names are case-insensitive.
* **skipPatchUpdates** (optional). Either an array of strings or boolean. The default value is an empty array. The array contains names of packages that should be excluded from the check if only patch part of their version was increased. Names are case-insensitive. You can set this property to `true` to exclude all packages if only patch part of their version was increased.
* **disableAudit** (optional). Boolean. The default value is `false`. This value indicates if audit of packages should be done for the `package.json` or not.
* **lowestAuditLevel** (optional). String. Default value is "low". This property can have one of the following values: *low*, *moderate*, *high*. It sets lowest possible level of audit problems, about which the extension will show notification. So, if you set this property to *moderate*, you'll get notification about audit problems of moderate, high and critical level, but will not have notifications about problems of low level.

```
{
    "disable": false,
    "skip": [
        "typescript"
    ],
    "skipPatchUpdates": [
        "lodash"
    ],
    "lowestAuditLevel": "moderate"
}
```

## Issues and Contributing

If you have found a bug or you want to suggest some improvements, create a pull request or an issue at [GitHub](https://github.com/yakimovim/vscode-check-npm-updates).

## Release Notes

### 1.7.8

Fix of security vulnerabilities in used NPM packages.

### 1.7.7

Fix of security vulnerabilities in used NPM packages.

### 1.7.6

Fix of security vulnerabilities in used NPM packages.

### 1.7.5

Fix of security vulnerabilities in used NPM packages.

### 1.7.4

Reduce size of the package.

### 1.7.3

Fix of security vulnerabilities in used NPM packages.

### 1.7.2

Fix of security vulnerabilities in used NPM packages.

### 1.7.1

Fix of security vulnerabilities in used NPM packages.

### 1.7.0

Support of audit analysis.

### 1.6.1

Update documentation.

### 1.6.0

Support of Yarn.

### 1.5.1

Fix of security vulnerabilities in used NPM packages.

### 1.5.0

Ability to exclude only updates in the patch part of a package version from the consideration.

### 1.4.1

Exclude `bower_components` folder from consideration.

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