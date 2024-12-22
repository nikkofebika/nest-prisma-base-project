import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pagination } from 'src/common/common.types';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IndexDto } from './dto/index.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserType } from './users.types';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const data = {
      ...createUserDto,
      created_by: 1,
    };

    return this.prismaService.user.create({ data: data });
  }

  async findAll(query: IndexDto): Promise<Pagination<User>> {
    const { page, per_page, sort, ...filters } = query;

    let where: Prisma.UserWhereInput;

    if (Object.keys(filters).length) {
      Object.entries(filters).forEach(([column, value]) => {
        where = {
          ...where,
          [column]: { contains: value },
        };
      });
    }

    const skip = (page - 1) * per_page;
    let users = await this.prismaService.user.findMany({
      where,
      skip,
      take: per_page,
    });

    users = users.map((user) => new UserEntity(user));
    const total = await this.prismaService.user.count({ where });

    return {
      data: users,
      meta: {
        current_page: page,
        from: (page - 1) * per_page + 1,
        per_page: per_page,
        to: page * per_page,
        total: total,
        total_pages: Math.ceil(total / per_page),
      },
    };
  }

  async findOne(id: number, select?: Prisma.UserSelect): Promise<User> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      select,
      where: { id },
    });

    return new UserEntity(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const data = {
      ...updateUserDto,
      updated_by: 2,
    };

    return this.prismaService.user.update({ where: { id }, data });
  }

  async delete(id: number): Promise<User> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });

    user.deleted_at = new Date();
    user.deleted_by = 1;

    return this.prismaService.user.update({ where: { id }, data: user });
  }

  async restore(id: number): Promise<User> {
    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });

    user.updated_at = new Date();
    user.deleted_at = null;
    user.deleted_by = null;

    return this.prismaService.user.update({ where: { id }, data: user });
  }

  async forceDelete(id: number): Promise<User> {
    return this.prismaService.user.delete({ where: { id } });
  }

  async hasType(user: User, userTypes: UserType[]): Promise<boolean> {
    if (user.type) return userTypes.includes(user.type as UserType);

    const userData = await this.findOne(user.id, { type: true });
    return userTypes.includes(userData.type as UserType);
  }

  async hasPermission(user: User, permissions: string[]): Promise<boolean> {
    const role = await this.prismaService.role.findFirst({
      select: { id: true },
      where: {
        id: user.role_id,
        permissions: {
          some: {
            permission: {
              name: {
                in: permissions,
              },
            },
          },
        },
      },
    });

    return !!role;
  }

  async getMyPermissions(user: User): Promise<string[]> {
    return [];
  }
}
