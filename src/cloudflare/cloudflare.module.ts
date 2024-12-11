import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
