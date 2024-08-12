import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  RegisterDto,
  ResendMobileVerificationDto,
  ResetPasswordDto,
  SignInDto,
  VerifyMobileDto,
} from './dtos/auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UsersService } from '../users/users.service';
import { AuthenticatedRequest } from 'src/common/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.emailOrMobile, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgotPassword')
  async forgotPassword(@Body() mobileData: ResendMobileVerificationDto) {
    await this.authService.forgotPassword(mobileData);
    return { message: 'OTP has been sent to your registered number!' };
  }

  @Post('resetPassword')
  resetPassword(@Body() resetPasswordData: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordData);
  }

  @Post('resendMobileVerification')
  async resendMobileVerification(
    @Body() mobileData: ResendMobileVerificationDto,
  ) {
    await this.authService.resendMobileVerification(mobileData);
    return { message: 'OTP has been sent to your registered number!' };
  }

  @Post('verifyMobile')
  async verifyMobile(@Body() verifyMobileData: VerifyMobileDto) {
    return this.authService.verifyMobile(verifyMobileData);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() password: ChangePasswordDto,
  ) {
    const user = await this.authService.changePassword(req.user.id, password);
    return { data: { user }, message: 'Password has been changed' };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    return { data: { user } };
  }
}
