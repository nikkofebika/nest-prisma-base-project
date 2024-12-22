import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from 'src/config/logger.config';
import { CustomExceptionFilter } from './custom-exception.filter';
import { CustomValidationPipePipe } from './custom-validation-pipe.pipe';
import { AuthGuard } from './guards/auth/auth.guard';
import { CommonResponseInterceptor } from './interceptors/common-response.interceptor';
import { PrismaService } from './services/prisma/prisma.service';
import { ExistValidator } from './validator/exist.validator';
import { UniqueValidator } from './validator/unique.validator';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionGuard } from './guards/permission/permission.guard';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    WinstonModule.forRoot(loggerConfig),
    UsersModule,
  ],
  providers: [
    PrismaService,
    ExistValidator,
    UniqueValidator,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipePipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommonResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    PermissionsService,
  ],
  exports: [PrismaService, PermissionsService],
})
export class CommonModule {}
