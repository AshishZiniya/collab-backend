import { Module } from '@nestjs/common';
import { CodingGateway } from './coding.gateway';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [ExecutionModule],
  providers: [CodingGateway],
})
export class CodingModule {}
