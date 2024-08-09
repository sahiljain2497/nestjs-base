import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  ObjectId,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
} from 'mongoose';
import { CreateUserDto } from './dtos/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<User>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findById(id: ObjectId): Promise<UserDocument> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findPaginated(
    filter: any,
    options: PaginateOptions,
  ): Promise<PaginateResult<UserDocument[]>> {
    return this.userModel.paginate(filter, options);
  }
}
