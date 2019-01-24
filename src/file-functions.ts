import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import * as logger from "./logger";

export function readFileAsync(path: string, options: any): Promise<any> {
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

function findPackageFilesUsingGlob(rootFolder: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(
      "**/package.json",
      {
        cwd: rootFolder,
        ignore: [
          "**/node_modules/**/package.json",
          "**/bower_components/**/package.json"
        ]
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

export async function findPackageFiles(rootFolder: string): Promise<string[]> {
  try {
    const arraysOfFiles = await findPackageFilesUsingGlob(rootFolder);

    // make flat list of 'package.json' files.
    let foundPackages: string[] = [];
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
