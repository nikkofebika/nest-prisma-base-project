import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from 'src/config/logger.config';
import { UsersModule } from 'src/users/users.module';
import { CustomExceptionFilter } from './custom-exception.filter';
import { CustomValidationPipePipe } from './custom-validation-pipe.pipe';
import { AuthGuard } from './guards/auth/auth.guard';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { PermissionGuard } from './guards/permission/permission.guard';
import { CommonResponseInterceptor } from './interceptors/common-response.interceptor';
import { PrismaService } from './services/prisma/prisma.service';
import { TokensService } from './services/tokens/tokens.service';
import { ExistValidator } from './validator/exist.validator';
import { UniqueValidator } from './validator/unique.validator';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    WinstonModule.forRoot(loggerConfig),
    EventEmitterModule.forRoot({
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          auth: {
            user: configService.get<string>('MAIL_USERNAME'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"nikko fe" <nikkofe@gmail.com>'
        }
      })
    }),
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
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    TokensService,
  ],
  exports: [PrismaService, TokensService],
})
export class CommonModule { }
