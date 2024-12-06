import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';

@Module({
  providers: [CloudflareService],
})
export class CloudflareModule {}
