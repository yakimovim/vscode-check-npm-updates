const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const defaultConfiguration = {
    disable: false,
    skip: []
}

function getConfiguration(folderPath) {
    const configFilePath = path.join(folderPath, ".checkNpmUpdates.json");
    return new Promise((resolve) => {
        if(fs.existsSync(configFilePath)) {
            logger.logInfo(`Configuration file is found at '${configFilePath}'`)
            fs.readFile(configFilePath, { encoding: 'utf8' }, (err, data) => {
                if(err) {
                    logger.logError(`Error reading configuration file at '${configFilePath}': ${err}`)
                    resolve(defaultConfiguration)
                } else {
                    try {
                        let configuration = JSON.parse(data)
                        configuration = Object.assign({}, defaultConfiguration, configuration)
                        configuration.skip = configuration.skip.map(p => p.toLowerCase())
                        resolve(configuration);
                    }
                    catch (exc) {
                        logger.logError(`Error converting configuration file at '${configFilePath}' to JSON`)
                        resolve(defaultConfiguration)
                    }
                }
            })
        }
        else {
            logger.logInfo(`Configuration file is not found at '${configFilePath}'`)
            resolve(defaultConfiguration)
        }
    })
}

exports.getConfiguration = getConfiguration;