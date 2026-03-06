import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Participant } from '../sessions/entities/participant.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Session, Participant],
        synchronize: true, // Auto-create tables (dev only)
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          // Important: Transaction poolers in Supabase do NOT support prepared statements
          poolSize: 10,
        },
        usePreparedStatementOptions: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
