import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDto,
  RegisterDto,
  ResendMobileVerificationDto,
  VerifyMobileDto,
} from './dtos/auth.dto';
import { ObjectId } from 'mongoose';
import { TwilioService } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  async signIn(emailOrMobile: string, pass: string) {
    const user = await this.usersService.findByEmailOrMobile(emailOrMobile);
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    if (!user.mobileVerifiedAt) {
      throw new UnauthorizedException({
        user,
        mobileVerified: false,
        message: 'Please verify mobile number to proceed',
      });
    }
    const payload = { id: user._id, email: user.email };
    return {
      user,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerData: RegisterDto) {
    const user = await this.usersService.create(registerData);
    return {
      user,
      mobileVerified: false,
      message: 'Please verify mobile number to proceed',
    };
  }

  async changePassword(_id: ObjectId, changePasswordData: ChangePasswordDto) {
    const hashedPassword = await bcrypt.hash(changePasswordData.password, 10);
    const user = await this.usersService.updateUser(_id, {
      password: hashedPassword,
    });
    return user;
  }

  async resendMobileVerification(mobileData: ResendMobileVerificationDto) {
    const user = await this.usersService.findOne({ mobile: mobileData.mobile });
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    await this.twilioService.client.verify.v2
      .services(this.configService.get('TWILIO_VERIFICATION_SERVICE_ID'))
      .verifications.create({ to: mobileData.mobile, channel: 'sms' });
  }

  async verifyMobile(verifyMobileData: VerifyMobileDto) {
    const user = await this.usersService.findOne({
      mobile: verifyMobileData.mobile,
    });
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    const verificationCheck = await this.twilioService.client.verify.v2
      .services(this.configService.get('TWILIO_VERIFICATION_SERVICE_ID'))
      .verificationChecks.create({
        to: verifyMobileData.mobile,
        code: verifyMobileData.otp,
      });
    return verificationCheck.status == 'approved';
  }
}
