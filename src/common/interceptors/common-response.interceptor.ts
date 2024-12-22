import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { IsReturnPagination } from '../decorators/reflectors/is-return-pagination/is-return-pagination.decorator';

@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  /**
   * If the controller handler has `@IsReturnPagination()` decorator,
   * it returns the original data. Otherwise, it wraps the data in
   * a `{ data: ... }` object.
   *
   * @param context The ExecutionContext for the current request.
   * @param next The next interceptor or the last controller method.
   *
   * @returns An Observable of the handled response.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const isReturnPagination =
      this.reflector.get(IsReturnPagination, context.getHandler()) || false;

    if (isReturnPagination) return next.handle();

    return next.handle().pipe(map((data) => ({ data })));
  }
}
