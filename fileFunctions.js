const fs = require('fs');
const path = require('path');
const glob = require('glob');
const logger = require('./logger');

function readFileAsync(path, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, options, (err, data) => {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
}

exports.readFileAsync = readFileAsync;

function findFilesUsingGlob(rootFolder, pattern) {
    return new Promise((resolve, reject) => {
        glob(pattern, { 
            cwd: rootFolder
        }, (err, files) => {
            if(err) {
                reject(err);
                return;
            }

            resolve(files);
        })
    });
}

function findPackageFiles(rootFolder) {
    return findFilesUsingGlob(rootFolder, "**/package.json")
    .catch(err => { 
        logger.logError(err);
        return []; 
    })
    .then(arraysOfFiles => {
        let foundPackages = [];
        arraysOfFiles.forEach(files => {
            foundPackages = foundPackages.concat(files);
        });
        return foundPackages;
    })
    .then(foundPackages => {
        return foundPackages.filter(packageFile => { 
            return packageFile.indexOf("node_modules") === -1;
        });
    })
    .then(foundPackages => {
        return foundPackages.map(packageFile => { 
            return path.join(rootFolder, packageFile);
        });
    })
    .catch(err => {
        logger.logError(err);
        return [];
    });
}

exports.findPackageFiles = findPackageFiles;