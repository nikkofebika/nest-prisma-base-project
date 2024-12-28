import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { NoNeedEmailVerification, Public } from 'src/common/guards/auth/auth.guard';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/common/decorators/params/user/user.decorator';
import { User as UserModel } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  async token(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @NoNeedEmailVerification()
  @Get('resend-email-verification')
  async resendEmailVerification(@User() user: UserModel) {
    if (user.email_verified_at) {
      throw new BadRequestException('Your email already verified');
    }

    return this.authService.resendEmailVerification(user);
  }

  @Public()
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}
