import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';

@Module({
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
