/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../../auth/auth.service';

const env = process.env;

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // callbackURL: `${env.HTTP_PROTOCOL}://${env.DOMAIN}${env.GOOGLE_CALLBACK_PARAM}`,
      callbackURL: `${env.GOOGLE_CALLBACK_URL}`,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = profile;
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    return done(null, profile);
  }
}
