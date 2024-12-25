import { PrismaClient } from "@prisma/client";
import { PermissionUnit, PermissionsService } from "../src/permissions/permissions.service";
import { PrismaService } from '../src/common/services/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const permissionService = new PermissionsService(new PrismaService);

async function main() {
    const permissions = permissionService.getAllPermissions<PermissionUnit>();
    for (const key in permissions) {
        let parent = await prisma.permission.upsert({
            where: { name: key },
            update: {},
            create: {
                name: key
            }
        })

        permissions[key].forEach(async (permission: string) => {
            await prisma.permission.upsert({
                where: { name: permission },
                update: {},
                create: {
                    name: permission,
                    parent: {
                        connect: { id: parent.id }
                    }
                }
            })
        })
    }

    const userRole = await prisma.role.upsert({
        where: { id: 1, name: "user" },
        update: {},
        create: {
            name: "user",
            created_by: 1
        }
    });

    const password = await bcrypt.hash("12345678", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@gmail.com" },
        update: {},
        create: {
            name: "Admin",
            email: "admin@gmail.com",
            password: password,
            type: "admin",
            email_verified_at: new Date(),
            created_by: 1
        }
    });

    const user = await prisma.user.upsert({
        where: { email: "user@gmail.com" },
        update: {},
        create: {
            name: "User",
            email: "user@gmail.com",
            password: password,
            type: "user",
            email_verified_at: new Date(),
            created_by: 1,
            role: {
                connect: {
                    id: userRole.id
                }
            }
        }
    });
}

main()
    .then(async () => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })