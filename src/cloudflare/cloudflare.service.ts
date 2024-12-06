import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  baseUrl: string;
}

interface DNSRecord {
  type: string;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
  priority?: number;
}

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly config: CloudflareConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      apiToken: this.configService.get<string>('CLOUDFLARE_API_TOKEN'),
      zoneId: this.configService.get<string>('CLOUDFLARE_ZONE_ID'),
      baseUrl: 'https://api.cloudflare.com/client/v4',
    };
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * DNS 레코드 생성
   */
  async createDNSRecord(record: DNSRecord) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
        record,
        { headers: this.headers }
      );

      this.logger.log(`DNS 레코드 생성됨: ${record.name}`);
      return response.data.result;
    } catch (error) {
      this.logger.error(`DNS 레코드 생성 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * DNS 레코드 조회
   */
  async getDNSRecord(recordId: string) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`,
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      this.logger.error(`DNS 레코드 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * DNS 레코드 목록 조회
   */
  async listDNSRecords(params?: { 
    name?: string; 
    type?: string;
    page?: number;
    per_page?: number;
  }) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
        { 
          headers: this.headers,
          params
        }
      );

      return response.data.result;
    } catch (error) {
      this.logger.error(`DNS 레코드 목록 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * DNS 레코드 수정
   */
  async updateDNSRecord(recordId: string, record: Partial<DNSRecord>) {
    try {
      const response = await axios.patch(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`,
        record,
        { headers: this.headers }
      );

      this.logger.log(`DNS 레코드 수정됨: ${recordId}`);
      return response.data.result;
    } catch (error) {
      this.logger.error(`DNS 레코드 수정 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * DNS 레코드 삭제
   */
  async deleteDNSRecord(recordId: string) {
    try {
      const response = await axios.delete(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`,
        { headers: this.headers }
      );

      this.logger.log(`DNS 레코드 삭제됨: ${recordId}`);
      return response.data.result;
    } catch (error) {
      this.logger.error(`DNS 레코드 삭제 실패: ${error.message}`);
      throw error;
    }
  }
}
