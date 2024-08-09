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

  @Post('resendMobileVerification')
  resendMobileVerification(@Body() mobileData: ResendMobileVerificationDto) {
    return this.authService.resendMobileVerification(mobileData);
  }

  @Post('verifyMobile')
  verifyMobile(@Body() verifyMobileData: VerifyMobileDto) {
    return this.authService.verifyMobile(verifyMobileData);
  }

  @UseGuards(AuthGuard)
  @Post('changePassword')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() password: ChangePasswordDto,
  ) {
    const user = await this.authService.changePassword(req.user.id, password);
    return { data: { user } };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    return { data: { user } };
  }
}
