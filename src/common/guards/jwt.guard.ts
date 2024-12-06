import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { config } from 'dotenv';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
config();

const env = process.env;

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const isValid = await super.canActivate(context);

    if (!isValid) throw new UnauthorizedException();

    const user = request.user;
    console.log(user ?? undefined);

    const payload = { id: user.google_mail };
    request.id = user.google_mail;

    return payload;
  }
}
