/**
 * 도메인 서비스
 * 도메인 등록, 서브도메인 레코드 생성, 덮어쓰기, 삭제
 * 도메인이 등록될 경우, mongo db에 점유 정보를 저장해야 한다.
 * 도메인 점유 정보는 도메인 만료 시 db에서 삭제되어야 한다. 동시에 레코드 또한 Cloudflare에서 삭제되어야 한다.
 * 이에 관련 함수 또한 필요하며, Cloudflare 통신을 위한 CloudflareService 연동 코드 또한 필요하다.
 * src/models/domain.schema.ts 참고
 * 
 * 레코드 업데이트 함수가 반드시 필요하다.
 * ```
auth service 필요 내용
- sign in / out
- register / delete acc
- my information
	- my domain list
		- click event : redirect to management page
	- my id, email, profilephoto
```

```
domain service 필요 내용
- domain registration
- domain expire (cron per 1 day)
- domain record crud
	- edit의 경우 만약 사용자가 a.peq.us를 빌렸다면, *.a.peq.us를 관리할 수 있게 허용
- view existing records
- is domain using
```

```
cloudflare service 필요 내용
- record create, edit, update, read function
```

PeQ를 통해 a.peq.us를 점유하고, 레코드를 수정하지 않았다면, cloudflare에는 반영하지 않으나, DB에는 소유중으로 표기해야 함.

```
domain schema
subdomain_name
owner_email
expire_date
records: [{ name: string, record_type: string, value: string }]
```
 * 
 */

import { Injectable, Logger } from '@nestjs/common';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import DomainModel from '../models/domain.schema';
import {
  RegisterDomainDto,
  CreateSubdomainRecordDto, 
  OverwriteSubdomainRecordDto,
  DeleteSubdomainRecordDto
} from './dto';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(
    private readonly cloudflareService: CloudflareService
  ) {}

  /**
   * 도메인 등록
   */
  async registerDomain(registerDomainDto: RegisterDomainDto) {
    try {
      const domain = new DomainModel({
        subdomain_name: registerDomainDto.name,
        owner_gmail: registerDomainDto.ownerGmail,
        expire_date: registerDomainDto.expireDate,
        records: []
      });

      await domain.save();
      this.logger.log(`도메인 등록됨: ${domain.subdomain_name}`);
      return domain;
    } catch (error) {
      this.logger.error(`도메인 등록 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 사용 가능 여부 확인
   */
  async checkDomainAvailability(name: string): Promise<boolean> {
    try {
      const domain = await DomainModel.findOne({
        subdomain_name: name.toLowerCase()
      });

      this.logger.log(`도메인 사용 가능 여부 확인: ${name}`);
      return !domain;
    } catch (error) {
      this.logger.error(`도메인 사용 가능 여부 확인 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 서브도메인 레코드 생성
   */
  async createSubdomainRecord(createSubdomainRecordDto: CreateSubdomainRecordDto) {
    try {
      const domain = await DomainModel.findOne({
        subdomain_name: createSubdomainRecordDto.name
      });

      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      const record = {
        type: createSubdomainRecordDto.type,
        name: `${createSubdomainRecordDto.name}`,
        content: createSubdomainRecordDto.target,
        proxied: createSubdomainRecordDto.proxied,
        ttl: createSubdomainRecordDto.ttl
      };

      const cloudflareRecord = await this.cloudflareService.createDNSRecord(record);

      domain.records.push({
        record_name: createSubdomainRecordDto.name,
        record_value: createSubdomainRecordDto.target,
        record_type: createSubdomainRecordDto.type
      });

      await domain.save();
      return cloudflareRecord;
    } catch (error) {
      this.logger.error(`레코드 생성 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 서브도메인 레코드 덮어쓰기
   */
  async overwriteSubdomainRecord(overwriteSubdomainRecordDto: OverwriteSubdomainRecordDto) {
    try {
      const domain = await DomainModel.findOne({
        subdomain_name: overwriteSubdomainRecordDto.name
      });

      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      // 기존 레코드 삭제
      const records = await this.cloudflareService.listDNSRecords({
        name: overwriteSubdomainRecordDto.name
      });

      if (records.length > 0) {
        await this.cloudflareService.deleteDNSRecord(records[0].id);
      }

      // 새 레코드 생성
      const record = {
        type: overwriteSubdomainRecordDto.type,
        name: overwriteSubdomainRecordDto.name,
        content: overwriteSubdomainRecordDto.target,
        proxied: overwriteSubdomainRecordDto.proxied,
        ttl: overwriteSubdomainRecordDto.ttl
      };

      return await this.cloudflareService.createDNSRecord(record);
    } catch (error) {
      this.logger.error(`레코드 덮어쓰기 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 서브도메인 레코드 삭제
   */
  async deleteSubdomainRecord(deleteSubdomainRecordDto: DeleteSubdomainRecordDto) {
    try {
      const domain = await DomainModel.findOne({
        subdomain_name: deleteSubdomainRecordDto.name
      });

      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      const records = await this.cloudflareService.listDNSRecords({
        name: deleteSubdomainRecordDto.name
      });

      if (records.length > 0) {
        await this.cloudflareService.deleteDNSRecord(records[0].id);
      }

      domain.records = domain.records.filter(
        record => record.record_name !== deleteSubdomainRecordDto.name
      );

      await domain.save();
      return { success: true };
    } catch (error) {
      this.logger.error(`레코드 삭제 실패: ${error.message}`);
      throw error;
    }
  }
