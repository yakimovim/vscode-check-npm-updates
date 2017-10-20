const dummyLogger = {
    error: () => {},
    info: () => {},
}

const logger = dummyLogger;
// const logger = console;

function logError(data) {
    logger.error(data);
}

exports.logError = logError;

function logInfo(data) {
    logger.info(data);
}

exports.logInfo = logInfo;