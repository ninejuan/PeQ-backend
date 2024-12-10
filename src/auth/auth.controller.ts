import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleGuard } from 'src/common/guards/google.guard';
import { Request as ExpressRequest, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { CreateAuthDto } from './dto/create-user.dto';
import axios from 'axios';

interface Request extends ExpressRequest {
  id?: any; // 또는 더 구체적인 타입을 사용할 수 있습니다
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Req() req: Request) {
    return req.id; // google strategy에서 req.user에 user를 지정해줘야 함.
  }

  @Get('/google/redirect')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('called by remote');
    const user = req.user;
    const tokens = await this.authService.handleGoogleLogin(user);

    response.header(
      'Access-Control-Allow-Origin',
      'https://subvencion.juany.kr',
    );
    response.header('Access-Control-Allow-Credentials', 'true');

    return { accessToken: tokens.accessToken };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    return { message: 'Logged out successfully' };
  }

  @Get('myinfo')
  @UseGuards(JwtAuthGuard)
  async getMyInfo(@Req() req: Request) {
    const user = req.user;
    return await this.authService.getMyInfo(user);
  }

  // @Post('myinfo')
  // @UseGuards(JwtAuthGuard)
  // async updateMyInfo(
  //   @Req() req: Request,
  //   @Body() updateData: Partial<CreateAuthDto>,
  // ) {
  //   const email = req.id;
  //   return await this.authService.updateMyInfo(email, updateData);
  // }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: Request) {
    const userData = req.user;
    return await this.authService.deleteAccount(userData.email);
  }
}
// ToDo: 로그인 할 때마다 유저 정보 업데이트 해주기
