import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDto,
  RegisterDto,
  ResendMobileVerificationDto,
  ResetPasswordDto,
  VerifyMobileDto,
} from './dtos/auth.dto';
import { Types } from 'mongoose';
import { TwilioService } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  async loginSuccessToken(user: UserDocument) {
    const payload = { id: user._id, email: user.email };
    return {
      user,
      accessToken: await this.jwtService.signAsync(payload),
      message: 'Login Successful!',
    };
  }

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
    return this.loginSuccessToken(user);
  }

  async register(registerData: RegisterDto) {
    const user = await this.usersService.create(registerData);
    return {
      user,
      mobileVerified: false,
      message: 'Please verify mobile number to proceed',
    };
  }

  async changePassword(
    _id: Types.ObjectId,
    changePasswordData: ChangePasswordDto,
  ) {
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
    if (verificationCheck.status != 'approved') {
      throw new UnauthorizedException('OTP Verification failed! Try again');
    }
    await this.usersService.updateUser(user._id, {
      mobileVerifiedAt: new Date(),
    });
    return this.loginSuccessToken(user);
  }

  async forgotPassword(mobileData: ResendMobileVerificationDto) {
    const user = await this.usersService.findOne({ mobile: mobileData.mobile });
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheManager.set(
      'user:' + user._id.toString() + ':password-reset',
      otp,
      5 * 60 * 1000,
    );
    await this.twilioService.client.messages.create({
      body: `Please use otp - ${otp} to reset password for your registered account.`,
      from: '+12542796428',
      to: mobileData.mobile,
    });
  }

  async resetPassword(resetPasswordData: ResetPasswordDto) {
    const user = await this.usersService.findOne({
      mobile: resetPasswordData.mobile,
    });
    if (!user) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }
    if (
      this.configService.get<string>('NODE_ENV') == 'development' &&
      resetPasswordData.otp == '111111'
    ) {
      return this.changePassword(user._id, {
        password: resetPasswordData.password,
      });
    }
    const otp = await this.cacheManager.get(
      'user:' + user._id.toString() + ':password-reset',
    );
    if (otp != resetPasswordData.otp) {
      throw new UnauthorizedException({ message: 'Invalid OTP' });
    }
    return this.changePassword(user._id, {
      password: resetPasswordData.password,
    });
  }
}
