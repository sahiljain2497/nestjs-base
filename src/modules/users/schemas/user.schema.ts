import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Date, required: false, default: false })
  mobileVerifiedAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(mongoosePaginate);
