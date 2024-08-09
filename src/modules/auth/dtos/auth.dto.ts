import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class SignInDto {
  @IsString()
  @MaxLength(255)
  emailOrMobile: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMobilePhone()
  mobile: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @MaxLength(20)
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @MaxLength(20)
  @IsNotEmpty()
  password: string;
}

export class ResendMobileVerificationDto {
  @IsMobilePhone()
  mobile: string;
}

export class VerifyMobileDto {
  @IsMobilePhone()
  mobile: string;

  @IsString()
  @MaxLength(6)
  otp: string;
}
