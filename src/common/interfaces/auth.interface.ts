import { Request } from 'express';
import { ObjectId } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user: { id: ObjectId; email: string };
}
