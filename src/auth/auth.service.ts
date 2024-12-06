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
    const { email, name, picture } = user;
    
    let existingUser = await this.userService.findByEmail(email);
    if (!existingUser) {
      existingUser = await this.userService.create({
        google_mail: email,
        name,
        profilePhoto: picture,
      });
    }

    const payload = { email: existingUser.google_mail, sub: existingUser._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getMyInfo(email: string) {
    const user = await this.userService.findByEmail(email);
    const domains = await this.userService.getUserDomains(email);
    
    return {
      id: user._id,
      email: user.google_mail,
      name: user.name,
      profilePhoto: user.profilePhoto,
      domains,
    };
  }

  async updateMyInfo(email: string, updateData: Partial<CreateAuthDto>) {
    return await this.userService.update(email, updateData);
  }

  async deleteAccount(email: string) {
    return await this.userService.delete(email);
  }
}
