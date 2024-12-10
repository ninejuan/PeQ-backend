import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async handleGoogleLogin(user: any) {
    let existingUser;
    let userData = {
      google_mail: user._json.email,
      name: user._json.name,
      profilePhoto: user._json.picture,
    };

    try {
      existingUser = await this.userService.findByEmail(user._json.email);
      existingUser.name = userData.name;
      existingUser.profilePhoto = userData.profilePhoto;
      await existingUser.save();
    } catch (e) {
      existingUser = null;
    }

    if (!existingUser) {
      existingUser = await this.userService.create(userData);
    }

    const payload = { email: existingUser.google_mail, sub: existingUser._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getMyInfo(userdata: any) {
    const user = await this.userService.findByEmail(userdata.email);

    return user;
  }

  async updateMyInfo(email: string, updateData: Partial<CreateAuthDto>) {
    return await this.userService.update(email, updateData);
  }

  async deleteAccount(email: string) {
    return await this.userService.delete(email);
  }
}
