import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email not valid' })
  email: string;

  @IsNotEmpty({ message: 'Name is mandatory' })
  name: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$&*])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}
