import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect().catch((e) => console.log(e));
  }

  async onModuleDestroy() {
    await this.$disconnect().catch((e) => console.log(e));
  }
}
