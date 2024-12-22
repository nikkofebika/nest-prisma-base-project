import { Controller, Get } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  async findAll() {
    return this.permissionService.getAllPermissions();
  }
}
