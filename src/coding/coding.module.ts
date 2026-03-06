import { Module } from '@nestjs/common';
import { CodingGateway } from './coding.gateway';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthModule } from '../auth/auth.module';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [SessionsModule, AuthModule, ExecutionModule],
  providers: [CodingGateway],
})
export class CodingModule {}
