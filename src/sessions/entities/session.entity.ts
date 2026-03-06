import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Participant } from './participant.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 50, default: 'javascript' })
  language: string;

  @Column({ type: 'text', default: '' })
  code_content: string;

  @Column({ length: 20, default: 'active' })
  status: string; // 'active' or 'completed'

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Many sessions can be created by one user
  @ManyToOne(() => User, user => user.created_sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // One session has many participants
  @OneToMany(() => Participant, participant => participant.session)
  participants: Participant[];
}
