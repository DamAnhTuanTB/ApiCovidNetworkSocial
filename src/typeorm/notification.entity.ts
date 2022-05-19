import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post, User } from './index';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  create_at: string;

  @Column({
    nullable: false,
    default: '',
    length: 1000,
  })
  content_texts: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;
}
