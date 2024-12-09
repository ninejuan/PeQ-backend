import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CloudflareModule, ConfigModule],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
