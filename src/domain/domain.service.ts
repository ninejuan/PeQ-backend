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

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(private readonly cloudflareService: CloudflareService) {}

  /**
   * 도메인 등록
   */
  async registerDomain(ownerGmail: string, subdomainName: string) {
    try {
      // 만료일 설정 (현재로부터 30일)
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      // 도메인 등록 정보 생성
      const domain = new DomainModel({
        subdomain_name: subdomainName,
        owner_gmail: ownerGmail,
        expire_date: expireDate,
        records: []
      });

      await domain.save();
      this.logger.log(`도메인 등록됨: ${subdomainName}`);

      return domain;
    } catch (error) {
      this.logger.error(`도메인 등록 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 사용 가능 여부 확인
   */
  async checkDomainAvailability(subdomainName: string): Promise<boolean> {
    try {
      // DB에서 도메인 검색
      const existingDomain = await DomainModel.findOne({ 
        subdomain_name: subdomainName 
      });

      // 도메인이 존재하지 않으면 사용 가능
      if (!existingDomain) {
        return true;
      }

      // 도메인이 만료되었는지 확인
      const now = new Date();
      if (existingDomain.expire_date < now) {
        return true;
      }

      // 도메인이 존재하고 만료되지 않았으면 사용 불가
      return false;

    } catch (error) {
      this.logger.error(`도메인 사용 가능 여부 확인 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 레코드 생성
   */
  async createDomainRecord(
    subdomainName: string, 
    recordName: string,
    recordValue: string,
    recordType: string,
    proxied: boolean = true,
    ttl: number = 3600
  ) {
    try {
      const domain = await DomainModel.findOne({ subdomain_name: subdomainName });
      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      // Cloudflare에 레코드 생성
      const cloudflareRecord = await this.cloudflareService.createDNSRecord({
        type: recordType,
        name: `${recordName}.${subdomainName}`,
        content: recordValue,
        proxied,
        ttl
      });

      // DB에 레코드 정보 저장
      domain.records.push({
        record_name: recordName,
        record_value: recordValue,
        record_type: recordType
      });

      await domain.save();
      return cloudflareRecord;
    } catch (error) {
      this.logger.error(`레코드 생성 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 레코드 수정
   */
  async updateDomainRecord(
    subdomainName: string,
    recordName: string,
    newRecordValue: string,
    recordType: string,
    proxied: boolean = true,
    ttl: number = 3600
  ) {
    try {
      const domain = await DomainModel.findOne({ subdomain_name: subdomainName });
      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      // 기존 레코드 찾기
      const recordIndex = domain.records.findIndex(
        record => record.record_name === recordName
      );

      if (recordIndex === -1) {
        throw new Error('레코드를 찾을 수 없습니다');
      }

      // Cloudflare 레코드 업데이트
      const records = await this.cloudflareService.listDNSRecords({
        name: `${recordName}.${subdomainName}`
      });

      if (records.length > 0) {
        await this.cloudflareService.updateDNSRecord(records[0].id, {
          type: recordType,
          name: `${recordName}.${subdomainName}`,
          content: newRecordValue,
          proxied,
          ttl
        });
      }

      // DB 레코드 업데이트
      domain.records[recordIndex].record_value = newRecordValue;
      domain.records[recordIndex].record_type = recordType;

      await domain.save();
      return domain.records[recordIndex];
    } catch (error) {
      this.logger.error(`레코드 수정 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 레코드 삭제
   */
  async deleteDomainRecord(subdomainName: string, recordName: string) {
    try {
      const domain = await DomainModel.findOne({ subdomain_name: subdomainName });
      if (!domain) {
        throw new Error('도메인을 찾을 수 없습니다');
      }

      // Cloudflare 레코드 삭제
      const records = await this.cloudflareService.listDNSRecords({
        name: `${recordName}.${subdomainName}`
      });

      if (records.length > 0) {
        await this.cloudflareService.deleteDNSRecord(records[0].id);
      }

      // DB에서 레코드 삭제
      domain.records = domain.records.filter(
        record => record.record_name !== recordName
      );

      await domain.save();
      return true;
    } catch (error) {
      this.logger.error(`레코드 삭제 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자의 도메인 목록 조회
   */
  async getUserDomains(ownerGmail: string) {
    try {
      return await DomainModel.find({ owner_gmail: ownerGmail });
    } catch (error) {
      this.logger.error(`도메인 목록 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 도메인 만료 처리 (Cron job)
   */
  async handleExpiredDomains() {
    try {
      const expiredDomains = await DomainModel.find({
        expire_date: { $lt: new Date() }
      });

      for (const domain of expiredDomains) {
        // Cloudflare에서 모든 레코드 삭제
        for (const record of domain.records) {
          const records = await this.cloudflareService.listDNSRecords({
            name: `${record.record_name}.${domain.subdomain_name}`
          });

          if (records.length > 0) {
            await this.cloudflareService.deleteDNSRecord(records[0].id);
          }
        }

        // DB에서 도메인 삭제
        await DomainModel.deleteOne({ _id: domain._id });
      }

      this.logger.log(`만료된 도메인 처리 완료: ${expiredDomains.length}개`);
    } catch (error) {
      this.logger.error(`도메인 만료 처리 실패: ${error.message}`);
      throw error;
    }
  }
}
