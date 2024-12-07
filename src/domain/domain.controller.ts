
import { Controller, Post, Get, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { DomainService } from './domain.service';
import {
  RegisterDomainDto,
  CreateSubdomainRecordDto,
  OverwriteSubdomainRecordDto, 
  DeleteSubdomainRecordDto
} from './dto';

@Controller('domain')
export class DomainController {
  private readonly logger = new Logger(DomainController.name);

  constructor(private readonly domainService: DomainService) {}

  @Post('register')
  async registerDomain(@Body() registerDomainDto: RegisterDomainDto) {
    this.logger.log('도메인 등록 요청');
    return await this.domainService.registerDomain(registerDomainDto);
  }

  @Get('available/:name')
  async checkDomainAvailability(@Param('name') name: string) {
    this.logger.log(`도메인 사용 가능 여부 확인 요청: ${name}`);
    return await this.domainService.checkDomainAvailability(name);
  }

  @Post('record')
  async createSubdomainRecord(@Body() createSubdomainRecordDto: CreateSubdomainRecordDto) {
    this.logger.log('서브도메인 레코드 생성 요청');
    return await this.domainService.createSubdomainRecord(createSubdomainRecordDto);
  }

  @Put('record')
  async overwriteSubdomainRecord(@Body() overwriteSubdomainRecordDto: OverwriteSubdomainRecordDto) {
    this.logger.log('서브도메인 레코드 덮어쓰기 요청');
    return await this.domainService.overwriteSubdomainRecord(overwriteSubdomainRecordDto);
  }

  @Delete('record')
  async deleteSubdomainRecord(@Body() deleteSubdomainRecordDto: DeleteSubdomainRecordDto) {
    this.logger.log('서브도메인 레코드 삭제 요청');
    return await this.domainService.deleteSubdomainRecord(deleteSubdomainRecordDto);
  }
}
