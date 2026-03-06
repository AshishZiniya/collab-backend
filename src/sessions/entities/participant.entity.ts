import { 
  Entity, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  JoinColumn, 
  PrimaryColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Session } from './session.entity';

@Entity('session_participants')
export class Participant {
  // Composite primary keys linking the two tables
  @PrimaryColumn('uuid')
  session_id: string;

  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ length: 20 })
  role: string; // 'interviewer' or 'candidate'

  @CreateDateColumn({ type: 'timestamp with time zone' })
  joined_at: Date;

  @ManyToOne(() => Session, session => session.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => User, user => user.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
