import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { User } from 'src/common/decorators/params/user/user.decorator';
import { IsReturnPagination } from 'src/common/decorators/reflectors/is-return-pagination/is-return-pagination.decorator';
import { HasPermission } from 'src/common/guards/permission/permission.guard';
import {
  userPermission
} from 'src/permissions/permissions.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IndexDto } from './dto/index.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { NoNeedEmailVerification } from 'src/common/guards/auth/auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { }

  @NoNeedEmailVerification()
  @Get('me')
  async me(@User() user: UserModel) {
    return user;
  }

  @HasPermission(userPermission.user_read)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @HasPermission(userPermission.user_read)
  @IsReturnPagination(true)
  @Get()
  async index(@Query() query: IndexDto) {
    return this.usersService.findAll(query);
  }

  @HasPermission(userPermission.user_read)
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  @HasPermission(userPermission.user_edit)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @HasPermission(userPermission.user_delete)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @HasPermission(userPermission.user_delete)
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  @HasPermission(userPermission.user_delete)
  @Delete(':id/force-delete')
  async forceDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.forceDelete(id);
  }
}
