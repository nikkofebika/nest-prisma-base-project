import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { TokensService } from 'src/common/services/tokens/tokens.service';
import { TokenType } from 'src/common/services/tokens/tokens.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.prismaService.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        password: true,
      },
      where: {
        email: loginDto.email,
        email_verified_at: { not: null },
      },
    });

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const { password, ...payload } = user;
      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new UnauthorizedException();
  }

  async register(registerDto: RegisterDto): Promise<any> {
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

  async verifyEmail(token: string): Promise<{ message: string }> {
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

  @OnEvent('user.registered', { async: true })
  async sendEmailVerification(user: User) {
    const token = await this.tokensService.generateToken(user, TokenType.EMAIL_VERIFICATION)
    const url = `${this.configService.get<string>('APP_URL')}/auth/verify/${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to the app',
      html: `<h1>Verify your email</h1><br/><a href="${url}">Verify</a>`,
    })
  }
}
