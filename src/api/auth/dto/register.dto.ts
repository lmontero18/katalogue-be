import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email not valid' })
  email: string;

  @IsNotEmpty({ message: 'Name is mandatory' })
  name: string;

  @MinLength(6, { message: 'Password must have at least 6 characters' })
  password: string;
}
