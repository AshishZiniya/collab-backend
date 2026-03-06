import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  OneToMany 
} from 'typeorm';
import { Session } from '../../sessions/entities/session.entity';
import { Participant } from '../../sessions/entities/participant.entity';

@Entity('users') // Maps this class to the 'users' table in PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // One user can create many sessions
  @OneToMany(() => Session, session => session.creator)
  created_sessions: Session[];

  // One user can participate in many sessions
  @OneToMany(() => Participant, participant => participant.user)
  participations: Participant[];
}
