import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ user: UserDocument; accessToken: string }> {
    const user = await this.usersService.findByEmail(email);
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Unauthorized');
    }
    const payload = { sub: user._id, email: user.email };
    return {
      user,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerData: RegisterDto): Promise<any> {
    const user = await this.usersService.create(registerData);
    const payload = { sub: user._id, email: user.email };
    return { user, accessToken: await this.jwtService.signAsync(payload) };
  }
}
