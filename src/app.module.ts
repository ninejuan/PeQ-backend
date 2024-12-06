import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DomainModule } from './domain/domain.module';
import { CloudflareService } from './cloudflare/cloudflare.service';

@Module({
  imports: [AuthModule, DomainModule, CloudflareModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
