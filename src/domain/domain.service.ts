import { Injectable } from '@nestjs/common';
import { RegisterDomainDto } from './dto/registerDomain.dto';
import { CreateSubdomainRecordDto } from './dto/createSubdomainRecord.dto';

@Injectable()
export class DomainService {
  registerSubdomain(registerDomainDto: RegisterDomainDto) {
    return 'This action adds a new domain';
  }

  findAll() {
    return `This action returns all domain`;
  }

  findOne(id: number) {
    return `This action returns a #${id} domain`;
  }

  update(id: number, updateDomainDto: UpdateDomainDto) {
    return `This action updates a #${id} domain`;
  }

  remove(id: number) {
    return `This action removes a #${id} domain`;
  }
}
