import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'bigint',
    default: null,
  })
  is_new: number;

  @Column({
    type: 'datetime',
    default: null,
  })
  start_time: string;

  @Column({
    type: 'datetime',
    default: null,
  })
  end_time: string;

  @Column({
    type: 'datetime',
    default: null,
  })
  updated_at: string;

  @Column({
    type: 'bigint',
    default: null,
  })
  evaluate: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  patient: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  expert: User;
}
