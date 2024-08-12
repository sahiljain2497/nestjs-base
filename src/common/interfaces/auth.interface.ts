import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user: { id: Types.ObjectId; email: string };
}
