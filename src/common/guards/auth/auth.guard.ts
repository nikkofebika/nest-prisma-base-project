import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

const IS_NO_NEED_EMAIL_VERIFICATION = 'isNoNeedEmailVerification';
export const NoNeedEmailVerification = () => SetMetadata(IS_NO_NEED_EMAIL_VERIFICATION, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    const isNoNeedEmailVerification = this.reflector.getAllAndOverride<boolean>(IS_NO_NEED_EMAIL_VERIFICATION, [
      context.getHandler(),
      context.getClass(),
    ]);


    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;

      if (isNoNeedEmailVerification && !request.user?.email_verified_at) {
        return true;
      }

      if (request.user?.email_verified_at) return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
