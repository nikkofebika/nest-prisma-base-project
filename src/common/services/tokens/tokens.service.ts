import { Prisma, Token, User } from "@prisma/client";
import { TokenType } from "./tokens.types";
import { PrismaService } from "../prisma/prisma.service";
import { randomBytes } from "crypto";
import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";

@Injectable()
export class TokensService {
    constructor(private readonly prismaService: PrismaService) { }

    async findToken(token: string, type: TokenType = TokenType.EMAIL_VERIFICATION): Promise<Token> {
        return this.prismaService.token.findFirst({
            include: { user: true },
            where: {
                token,
                type,
                expires_at: {
                    gte: DateTime.now().toString()
                }
            }
        });
    }

    async generateToken(user: User, type: TokenType): Promise<string> {
        const data: Prisma.TokenCreateInput = {
            type,
            token: randomBytes(16).toString('hex'),
            user: { connect: { id: user.id } },
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
        const token = await this.prismaService.token.create({ data })
        return token.token
    }

    async expireToken(token: string): Promise<void> {
        await this.prismaService.token.update({
            where: { token },
            data: { expires_at: new Date() }
        })
    }

    async clearUserToken(user: User, type: TokenType): Promise<void> {
        await this.prismaService.token.deleteMany({
            where: {
                user_id: user.id,
            }
        })
    }
}