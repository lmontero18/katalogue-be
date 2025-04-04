import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const appKey = request.headers['x-app-key'];
    const expectedKey = this.config.get<string>('INTERNAL_APP_KEY');

    if (appKey !== expectedKey) {
      throw new UnauthorizedException('Invalid App Key');
    }

    return true;
  }
}
