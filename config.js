const fs = require('fs');
const logger = require('./logger');

const defaultConfiguration = {
    disable: false,
    skip: []
}

function getConfiguration(path) {
    return new Promise((resolve) => {
        if(fs.existsSync(path)) {
            logger.logInfo(`Configuration file is found at '${path}'`)
            fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
                if(err) {
                    logger.logError(`Error reading configuration file at '${path}': ${err}`)
                    resolve(defaultConfiguration)
                } else {
                    try {
                        let configuration = JSON.parse(data)
                        configuration = Object.assign({}, defaultConfiguration, configuration)
                        configuration.skip = configuration.skip.map(p => p.toLowerCase())
                        resolve(configuration);
                    }
                    catch (exc) {
                        logger.logError(`Error converting configuration file at '${path}' to JSON`)
                        resolve(defaultConfiguration)
                    }
                }
            })
        }
        else {
            logger.logInfo(`Configuration file is not found at '${path}'`)
            resolve(defaultConfiguration)
        }
    })
}

exports.getConfiguration = getConfiguration;