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
import { Cron } from '@nestjs/schedule';
import { CloudflareService } from '../cloudflare/cloudflare.service';

interface Request extends ExpressRequest {
  id?: any;
  user?: any;
}

@Controller('domain')
export class DomainController {
  private readonly logger = new Logger(DomainController.name);

  constructor(
    private readonly domainService: DomainService,
    private readonly cloudflareService: CloudflareService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerDomain(
    @Req() req: Request,
    @Body() registerDomainDto: RegisterDomainDto,
  ) {
    this.logger.log('도메인 등록 요청');
    const user = req.user;
    return await this.domainService.registerDomain(
      registerDomainDto,
      user.email,
    );
  }

  @Get('available/:name')
  async checkDomainAvailability(@Param('name') name: string) {
    this.logger.log(`도메인 사용 가능 여부 확인 요청: ${name}`);
    const isAvailable = await this.domainService.checkDomainAvailability(name);
    return { available: isAvailable };
  }

  @UseGuards(JwtAuthGuard)
  @Get('records/:domain')
  async getDomainRecords(@Req() req: Request, @Param('domain') domain: string) {
    const user = req.user;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user.email,
      domain,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.getDomainRecords(domain);
  }

  @UseGuards(JwtAuthGuard)
  @Get('info/:domain')
  async getDomainInfo(@Req() req: Request, @Param('domain') domain: string) {
    const user = req.user;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user.email,
      domain,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.getDomainInfo(domain);
  }

  @UseGuards(JwtAuthGuard)
  @Post('record')
  async createSubdomainRecord(
    @Req() req: Request,
    @Body() createSubdomainRecordDto: CreateSubdomainRecordDto,
  ) {
    this.logger.log('서브도메인 레코드 생성 요청');
    const user = req.user;
    const domainName = createSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user.email,
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
    const user = req.user;
    const domainName = overwriteSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user.email,
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
    const user = req.user;
    const domainName = deleteSubdomainRecordDto.name;
    const isDomainOwner = await this.domainService.isDomainOwner(
      user.email,
      domainName,
    );
    if (!isDomainOwner) {
      throw new UnauthorizedException('도메인 소유자가 아닙니다');
    }
    return await this.domainService.deleteSubdomainRecord(
      deleteSubdomainRecordDto,
    );
  }

  @Cron('0 0 * * *') // 매일 0시 0분에 실행
  async handleExpiredDomains() {
    await this.domainService.handleExpiredDomains();
  }
}
/**
 * need to fix list
V * 1. schema에 dns record id 추가
V * 2. record create 시 record id 추가
 * 3. record update 시 record id 사용하여 업데이트
 * 4. record delete 시 record id 사용하여 삭제
 */

/**
 * needed service function list
 * 1. existing domain record 조회
 * 2. 4th level domain record crud (with cloudflare wildcard ssl)
 */
