import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './index';
import { Post } from './index';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  start_time: string;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  end_time: string;

  @Column({
    type: 'bigint',
  })
  evaluate: number;
}
