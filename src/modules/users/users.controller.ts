import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from 'src/common/dtos/dto';
import { ObjectId } from 'mongoose';
import { ParseObjectIdPipe } from 'nestjs-object-id';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async listUsers(@Query() queryParams: PaginationDto) {
    const result = await this.userService.findPaginated({}, { ...queryParams });
    return { data: result };
  }

  @Get(':id')
  async getUser(@Param('id', ParseObjectIdPipe) id: ObjectId) {
    const user = await this.userService.findById(id);
    return { data: { user } };
  }
}
