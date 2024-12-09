import {
  Controller,
  Req,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { DomainService } from './domain.service';
import {
  RegisterDomainDto,
  CreateSubdomainRecordDto,
  OverwriteSubdomainRecordDto,
  DeleteSubdomainRecordDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Request as ExpressRequest } from 'express';

interface Request extends ExpressRequest {
  id?: any;
}

@Controller('domain')
export class DomainController {
  private readonly logger = new Logger(DomainController.name);

  constructor(private readonly domainService: DomainService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerDomain(
    @Req() req: Request,
    @Body() registerDomainDto: RegisterDomainDto,
  ) {
    this.logger.log('도메인 등록 요청');
    return await this.domainService.registerDomain(registerDomainDto);
  }

  @Get('available/:name')
  async checkDomainAvailability(@Param('name') name: string) {
    this.logger.log(`도메인 사용 가능 여부 확인 요청: ${name}`);
    return await this.domainService.checkDomainAvailability(name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('record')
  async createSubdomainRecord(
    @Req() req: Request,
    @Body() createSubdomainRecordDto: CreateSubdomainRecordDto,
  ) {
    this.logger.log('서브도메인 레코드 생성 요청');
    const user = req.id;
    const domainName = createSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user,
      domainName,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.createSubdomainRecord(
      createSubdomainRecordDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('record')
  async overwriteSubdomainRecord(
    @Req() req: Request,
    @Body() overwriteSubdomainRecordDto: OverwriteSubdomainRecordDto,
  ) {
    this.logger.log('서브도메인 레코드 덮어쓰기 요청');
    const user = req.id;
    const domainName = overwriteSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user,
      domainName,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.overwriteSubdomainRecord(
      overwriteSubdomainRecordDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('record')
  async deleteSubdomainRecord(
    @Req() req: Request,
    @Body() deleteSubdomainRecordDto: DeleteSubdomainRecordDto,
  ) {
    this.logger.log('서브도메인 레코드 삭제 요청');
    const user = req.id;
    const domainName = deleteSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user,
      domainName,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.deleteSubdomainRecord(
      deleteSubdomainRecordDto,
    );
  }
}
// TODO : 도메인 소유자 검증 로직 필요
