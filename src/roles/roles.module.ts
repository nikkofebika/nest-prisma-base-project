import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
