import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ChatSession } from './chat_sessions.entity';

export enum UserRole {
  ADMIN = 'admin',
  EXPERT = 'expert',
  PATIENT = 'patient',
}
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: null,
  })
  role: UserRole;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  created_at: string;

  @Column({
    nullable: false,
    default: '',
    length: 1000,
  })
  content_texts: string;

  @Column({
    default: null,
    length: 1000,
  })
  content_images: string;

  @ManyToOne(() => ChatSession, { onDelete: 'CASCADE' })
  chat_session: ChatSession;
}
