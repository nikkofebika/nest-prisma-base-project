import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma/prisma.service';

export type PermissionUnit = Record<string, string[]>;

export const userPermission = {
  user_access: 'user_access',
  user_read: 'user_read',
  user_create: 'user_create',
  user_edit: 'user_edit',
  user_delete: 'user_delete',
};

export const rolePermission = {
  role_access: 'role_access',
  role_read: 'role_read',
  role_create: 'role_create',
  role_edit: 'role_edit',
  role_delete: 'role_delete',
};

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  userPermission(): PermissionUnit {
    return {
      [userPermission.user_access]: [
        userPermission.user_read,
        userPermission.user_create,
        userPermission.user_edit,
        userPermission.user_delete,
      ],
    };
  }

  rolePermission(): PermissionUnit {
    return {
      [rolePermission.role_access]: [
        rolePermission.role_read,
        rolePermission.role_create,
        rolePermission.role_edit,
        rolePermission.role_delete,
      ],
    };
  }

  /**
   * Gets all permissions.
   *
   * If `flatten` is `true`, this function will return a single array of all permissions.
   * Otherwise, it will return an array of objects, where each object has a key that is the
   * name of the permission, and the value is an array of strings representing the
   * individual permissions.
   *
   * @param {boolean} [flatten=false] If `true`, returns a single array of all permissions.
   * @returns {PermissionUnit | string[]} The permissions.
   */
  getAllPermissions<T extends PermissionUnit | string[]>(
    flatten: boolean = false,
  ): T {
    const allPermissions = [this.userPermission(), this.rolePermission()];

    if (!flatten) {
      const result = allPermissions.reduce((acc, current) => {
        const [key, value] = Object.entries(current)[0];
        acc[key] = value;
        return acc;
      }, {});
      return result as T;
    }

    const flatPermissions: string[] = allPermissions.flatMap((permissions) => {
      for (const key in permissions) {
        return [key, ...permissions[key]];
      }
    });

    return flatPermissions as T;
  }

  async getPermissionsByNames(names: string[], key?: string): Promise<any> {
    const permissions = await this.prismaService.permission.findMany({
      select: {
        id: true,
      },
      where: {
        name: {
          in: names,
        },
      },
    });

    if (key) return permissions.map((permission) => ({ [key]: permission.id }));

    return permissions;
  }
}
