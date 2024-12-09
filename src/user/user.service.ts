import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from '../auth/dto/create-user.dto';
import userSchema from '../models/user.schema';

@Injectable()
export class UserService {
  async findByEmail(email: string) {
    const user = await userSchema.findOne({ google_mail: email });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }
    return user;
  }

  async create(userData: Partial<CreateAuthDto>) {
    const userDto = {
      google_mail: userData.google_mail,
      name: userData.name,
      profilePhoto: userData.profilePhoto,
    };
    
    const newUser = await new userSchema(userDto).save();
    return newUser;
  }

  async update(email: string, updateData: Partial<CreateAuthDto>) {
    const user = await userSchema.findOneAndUpdate(
      { google_mail: email },
      { 
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.profilePhoto && { profilePhoto: updateData.profilePhoto }),
      },
      { new: true }
    );
    
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }
    return user;
  }

  async delete(email: string) {
    const user = await userSchema.findOneAndDelete({ google_mail: email });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }
    return { message: '계정이 삭제되었습니다' };
  }

  async getUserDomains(email: string) {
    const user = await this.findByEmail(email);
    return user.domains;
  }

  async addUserDomain(email: string, domain: string) {
    const user = await this.findByEmail(email);
    user.domains.push(domain);
    await user.save();
    return user;
  }

  async removeUserDomain(email: string, domain: string) {
    const user = await this.findByEmail(email);
    user.domains = user.domains.filter((d) => d !== domain);
    await user.save();
    return user;
  }
} 