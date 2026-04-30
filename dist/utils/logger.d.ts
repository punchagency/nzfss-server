import winston from 'winston';
declare module 'winston' {
    interface Logger {
        payload: winston.LeveledLogMethod;
        authorized: winston.LeveledLogMethod;
        downloading: winston.LeveledLogMethod;
        uploading: winston.LeveledLogMethod;
        tokenType: winston.LeveledLogMethod;
    }
}
declare const logger: winston.Logger;
export { logger };
