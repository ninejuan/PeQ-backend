import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import User from 'src/interface/user.interface';
import userSchema from 'src/models/user.schema';
import { JwtPayload } from 'src/interface/jwt-payload.interface';
import { CreateAuthDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async handleGoogleLogin(user: any) {
    console.log(user);
    let existingUser: any = await this.findUserByEmail(user._json.email);
    if (!existingUser) {
      const userDto: CreateAuthDto = {
        google_mail: user._json.email,
        name: `${user._json.nestjsame}`,
        profilePhoto: user._json.picture,
      };

      existingUser = await this.createUser(userDto);
    }
    const generatedTokens = await this.generateTokens(existingUser);
    return generatedTokens;
  }

  async generateTokens(user: User) {
    const payload: JwtPayload = {
      google_mail: user.google_mail,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.findUserByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findUserByEmail(email: String) {
    const user = await userSchema.findOne({ google_mail: `${email}` });
    return user;
  }

  async createUser(userDto: CreateAuthDto): Promise<User> {
    const newUser = await new userSchema(userDto).save();
    return newUser;
  }
}
