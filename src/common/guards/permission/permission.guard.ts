import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { UserType } from 'src/users/users.types';

const PERMISSION = 'permission';
export const HasPermission = (permission: string, userTypes?: UserType[]) =>
  SetMetadata(PERMISSION, { permission, userTypes });

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (user?.type === UserType.ADMIN) return true;

    const permission = this.reflector.getAllAndOverride<{
      permission: string;
      userTypes?: UserType[];
    }>(PERMISSION, [context.getHandler(), context.getClass()]);
    if (!permission) return true;

    if (permission.userTypes) {
      return this.usersService.hasType(user, permission.userTypes);
    }

    return this.usersService.hasPermission(user, [permission.permission]);
  }
}
