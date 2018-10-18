const fs = require("fs");
const path = require("path");
const glob = require("glob");
const logger = require("./logger");

function readFileAsync(path, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.readFileAsync = readFileAsync;

function findPackageFilesUsingGlob(rootFolder) {
  return new Promise((resolve, reject) => {
    glob(
      "**/package.json",
      {
        cwd: rootFolder,
        ignore: ["**/node_modules/**/package.json"]
      },
      (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(files);
      }
    );
  });
}

async function findPackageFiles(rootFolder) {
  try {
    const arraysOfFiles = await findPackageFilesUsingGlob(rootFolder);

    // make flat list of 'package.json' files.
    let foundPackages = [];
    arraysOfFiles.forEach(files => {
      foundPackages = foundPackages.concat(files);
    });

    // exclude 'package.json' files in 'node_modules' folders.
    foundPackages = foundPackages.filter(packageFile => {
      return (
        packageFile.indexOf("node_modules") === -1 &&
        packageFile.indexOf("bower_components") === -1
      );
    });

    // make full paths to 'package.json' files.
    foundPackages = foundPackages.map(packageFile => {
      return path.join(rootFolder, packageFile);
    });

    return foundPackages;
  } catch (error) {
    logger.logError(error);
    return [];
  }
}

exports.findPackageFiles = findPackageFiles;
