import { WinstonModuleOptions, utilities } from 'nest-winston';
import { format, transports } from 'winston';

let logger: WinstonModuleOptions;
if (process.env.NODE_ENV !== 'production') {
  logger = {
    format: format.json(),
    transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combine.log', level: 'info' }),
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike(process.env.APP_NAME, {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
      }),
    ],
  };
} else {
  logger = {
    format: format.json(),
    transports: [
      new transports.File({
        filename: 'logs/app.log',
        handleExceptions: true,
        handleRejections: true,
        format: format.combine(
          format.timestamp(),
          format.ms(),
          format.json(),
          // utilities.format.nestLike('silit', {
          //     // prettyPrint: true,
          //     processId: true,
          //     appName: true,
          //   }),
        ),
      }),
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.ms(),
          utilities.format.nestLike('silit', {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
      }),
    ],
  };
}

export const loggerConfig = logger;
