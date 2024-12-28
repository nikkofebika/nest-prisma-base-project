import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { TokensService } from 'src/common/services/tokens/tokens.service';
import { TokenType } from 'src/common/services/tokens/tokens.types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type ReturnMessage = { message: string }
type JwtPayload = {
  id: number;
  name: string;
  email: string;
  type: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string, refresh_token: string }> {
    const user = await this.prismaService.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        password: true,
        email_verified_at: true,
      },
      where: {
        email: loginDto.email,
        // email_verified_at: { not: null }, // remove this condition since user can login even if email is not verified and can resend email verification
      },
    });

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const { password, ...payload } = user;
      const [access_token, refresh_token] = await Promise.all([
        this.createJwtToken(payload),
        this.createJwtToken(payload, true),
      ]);

      return {
        access_token,
        refresh_token,
      };
    }

    throw new UnauthorizedException();
  }

  async createJwtToken(payload: JwtPayload, isRefreshToken: boolean = false): Promise<string> {
    if (isRefreshToken) {
      return this.jwtService.signAsync(payload, { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: '7d' });
    }

    return this.jwtService.signAsync(payload);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string, refresh_token: string }> {
    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshTokenDto.refresh_token, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') });
    if (!payload) throw new UnauthorizedException();

    const user = await this.prismaService.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
      where: {
        id: payload.id
      },
    });

    const [access_token, refresh_token] = await Promise.all([
      this.createJwtToken(user),
      this.createJwtToken(user, true),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async register(registerDto: RegisterDto): Promise<ReturnMessage> {
    const user = await this.prismaService.user.create({
      data: {
        ...registerDto,
        password: await bcrypt.hash(registerDto.password, 10)
      }
    });

    this.eventEmitter.emit('user.registered', user);

    return {
      message: 'Please check your email to verify your account'
    }
  }

  async resendEmailVerification(user: User): Promise<ReturnMessage> {
    await this.tokensService.clearUserToken(user, TokenType.EMAIL_VERIFICATION);

    this.eventEmitter.emit('user.registered', user);

    return {
      message: 'Please check your email to verify your account'
    }
  }

  async verifyEmail(token: string): Promise<ReturnMessage> {
    const dataToken = await this.tokensService.findToken(token);

    if (!dataToken) throw new BadRequestException();

    await this.prismaService.user.update({
      where: {
        id: dataToken.user_id
      },
      data: {
        email_verified_at: new Date()
      }
    })

    await this.tokensService.expireToken(token);

    return {
      message: 'Email verified'
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ReturnMessage> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: forgotPasswordDto.email
      }
    })

    if (!user) throw new NotFoundException("User not found");

    this.eventEmitter.emit('user.forgot-password', user);

    return {
      message: 'Please check your email to reset your password'
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<ReturnMessage> {
    const dataToken = await this.tokensService.findToken(token, TokenType.RESET_PASSWORD);

    if (!dataToken) throw new BadRequestException();

    await this.prismaService.user.update({
      where: {
        id: dataToken.user_id
      },
      data: {
        password: await bcrypt.hash(resetPasswordDto.password, 10)
      }
    })

    await this.tokensService.expireToken(token);

    return {
      message: 'Password reset successfully'
    };
  }

  @OnEvent('user.registered', { async: true })
  async sendEmailVerification(user: User): Promise<void> {
    const token = await this.tokensService.generateToken(user, TokenType.EMAIL_VERIFICATION)
    const url = `${this.configService.get<string>('APP_URL')}/auth/verify-email/${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to the app',
      html: `<h1>Verify your email</h1><br/><p>Click this link to verify your email <a href="${url}">Verify</a></p>`,
    })
  }

  @OnEvent('user.forgot-password', { async: true })
  async sendEmailResetPassword(user: User): Promise<void> {
    const token = await this.tokensService.generateToken(user, TokenType.RESET_PASSWORD)
    const url = `${this.configService.get<string>('APP_URL')}/auth/reset-password/${token}`; // this may frontend url
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset password',
      html: `<h1>Reset password</h1><br/><p>Click this link to reset your password <a href="${url}">Verify</a></p>`,
    })
  }
}
