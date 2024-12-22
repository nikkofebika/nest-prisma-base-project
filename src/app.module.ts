import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { AddressModule } from './address/address.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    AddressModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
