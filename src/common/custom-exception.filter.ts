import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

type ErrorResponse = {
  message: any;
  error?: string;
  statusCode: number;
};

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  // constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let data: ErrorResponse;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      data = exception.getResponse() as ErrorResponse;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      statusCode = HttpStatus.NOT_FOUND;
      data = {
        message: exception.message,
        statusCode,
      };
    } else {
      // this.logger.error(exception)
      console.log('exception message', exception.message);
      console.log('exception name', exception.name);
      console.log('exception stack', exception.stack);
      data = {
        message: 'Internal Server Error',
        statusCode,
      };
    }

    response.status(statusCode).json(data);
  }
}
