import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async signToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwt.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });
  }

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Este correo ya está registrado');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
        },
      });

      const token = await this.signToken(user.id, user.email);

      return {
        accessToken: token,
        user,
      };
    } catch (error) {
      console.error('Error in register:', error);
      throw new InternalServerErrorException(
        'something went wrong when adding the user',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) throw new UnauthorizedException('Invalid Credentials');

      const passwordMatch = await bcrypt.compare(dto.password, user.password);

      if (!passwordMatch)
        throw new UnauthorizedException('Invalid Credentials');

      const { password, ...result } = user;

      const token = await this.signToken(user.id, user.email);

      return {
        accessToken: token,
        user: result,
      };
    } catch (error) {
      console.error('Error in login', error);
      throw error;
    }
  }
}
