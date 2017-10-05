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

function findPackageFilesUsingGlob(rootFolder) {
    return new Promise((resolve, reject) => {
        glob('**/package.json', { 
            cwd: rootFolder,
            ignore: [ '**/node_modules/**/package.json' ]
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
    return findPackageFilesUsingGlob(rootFolder)
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