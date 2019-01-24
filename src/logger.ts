interface ILogger {
  info(message?: any): void;
  error(message?: any): void;
}

const dummyLogger: ILogger = {
  error: () => {},
  info: () => {}
};

const logger: ILogger = dummyLogger;
//const logger = console;

export function logError(data?: any) {
  logger.error(data);
}

export function logInfo(data?: any) {
  logger.info(data);
}
