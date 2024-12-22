import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
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
}
