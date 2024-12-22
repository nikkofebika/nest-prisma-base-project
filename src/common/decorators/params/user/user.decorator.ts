import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';

export const User: any = createParamDecorator<keyof UserModel>(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
