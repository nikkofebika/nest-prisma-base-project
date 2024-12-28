import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
        throw new HttpException({
            message: `To many requests. Try again in ${throttlerLimitDetail.timeToBlockExpire} seconds`,
            error: 'Too many requests',
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            ttl: throttlerLimitDetail.timeToBlockExpire
        }, HttpStatus.TOO_MANY_REQUESTS)
    }
}