import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsReturnPagination } from 'src/common/decorators/reflectors/is-return-pagination/is-return-pagination.decorator';
import { HasPermission } from 'src/common/guards/permission/permission.guard';
import { rolePermission } from 'src/permissions/permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllDto } from './dto/find-all.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @HasPermission(rolePermission.role_create)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @HasPermission(rolePermission.role_read)
  @IsReturnPagination(true)
  @Get()
  findAll(@Query() query: FindAllDto) {
    return this.rolesService.findAll(query);
  }

  @HasPermission(rolePermission.role_read)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @HasPermission(rolePermission.role_edit)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @HasPermission(rolePermission.role_delete)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @HasPermission(rolePermission.role_delete)
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.restore(id);
  }

  @HasPermission(rolePermission.role_delete)
  @Delete(':id/force-delete')
  async forceDelete(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.forceDelete(id);
  }
}
