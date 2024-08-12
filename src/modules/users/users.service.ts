import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  Types,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
  ObjectId,
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

  async findById(id: Types.ObjectId | ObjectId): Promise<UserDocument> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailOrMobile(emailOrMobile: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] })
      .exec();
  }

  async findOne(filter: {
    mobile?: string;
    email?: string;
    name?: string;
  }): Promise<UserDocument> {
    return this.userModel.findOne(filter).exec();
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

  async updateUser(
    _id: Types.ObjectId,
    updateBody: any,
  ): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id }, { $set: updateBody }, { new: true })
      .exec();
  }

  async deleteById(_id: Types.ObjectId) {
    return this.userModel.deleteOne({ _id }).exec();
  }
}
