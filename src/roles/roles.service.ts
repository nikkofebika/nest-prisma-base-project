import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import ISoftDeleteService from 'src/common/contracts/soft-delete.interface';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllDto } from './dto/find-all.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class RolesService implements ISoftDeleteService<Role> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionService: PermissionsService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<any> {
    const { permissions, ...validated } = createRoleDto;

    const dto = {
      ...validated,
      created_by: 1,
    };

    const permissionIds = await this.permissionService.getPermissionsByNames(
      permissions,
      'permission_id',
    );

    const data = await this.prismaService.role.create({
      data: {
        ...dto,
        permissions: {
          create: permissionIds,
        },
      },
    });
    return data;
  }

  async findAll(query: FindAllDto) {
    const { page, per_page, sort, ...filters } = query;

    let where: Prisma.RoleWhereInput;

    if (Object.keys(filters).length) {
      Object.entries(filters).forEach(([column, value]) => {
        where = {
          ...where,
          [column]: { contains: value },
        };
      });
    }

    const skip = (page - 1) * per_page;
    const data = await this.prismaService.role.findMany({
      where,
      skip,
      take: per_page,
    });

    const total = await this.prismaService.role.count({ where });

    return {
      data,
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

  async findOne(id: number): Promise<Role> {
    const data = await this.prismaService.role.findFirstOrThrow({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return data;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<any> {
    const { permissions, ...validated } = updateRoleDto;

    const dto = {
      ...validated,
      updated_by: 1,
    };

    await this.prismaService.role.update({
      where: { id },
      data: {
        permissions: {
          deleteMany: {},
        },
      },
    });

    const permissionIds = await this.permissionService.getPermissionsByNames(
      permissions,
      'permission_id',
    );

    const [_, data] = await Promise.all([
      this.prismaService.role.update({
        where: { id },
        data: {
          permissions: {
            deleteMany: {},
          },
        },
      }),
      this.prismaService.role.update({
        where: { id },
        data: {
          ...dto,
          permissions: {
            create: permissionIds,
          },
        },
      }),
    ]);

    return data;
  }

  async remove(id: number): Promise<Role> {
    return this.prismaService.role.update({
      where: { id },
      data: { deleted_by: 1, deleted_at: new Date() },
    });
  }

  async restore(id: number): Promise<Role> {
    return this.prismaService.role.update({
      where: { id },
      data: { deleted_at: null },
    });
  }

  async forceDelete(id: number): Promise<Role> {
    return this.prismaService.role.delete({ where: { id } });
  }
}
