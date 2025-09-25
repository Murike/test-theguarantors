import { Module } from '@nestjs/common';
import { ConciliationService } from './conciliation.service';

@Module({
  providers: [ConciliationService],
  exports: [ConciliationService],
})
export class ConciliationModule {}
