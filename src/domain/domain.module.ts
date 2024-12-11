import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [CloudflareModule, ConfigModule, UserModule],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
