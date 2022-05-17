import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ChatSession } from './chat_sessions.entity';
import { User } from './index';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ChatSession, { onDelete: 'CASCADE' })
  chatSession: ChatSession;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  create_at: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isSent: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isSeen: boolean;

  @Column({
    nullable: false,
    default: '',
    length: 1000,
  })
  content_texts: string;

  @Column({
    nullable: false,
    default: '',
    length: 1000,
  })
  content_images: string;
}
