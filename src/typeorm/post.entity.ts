import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './index';
export enum StatusPost {
  SUCCESS = 'success',
  PENDING = 'pending',
  CANCEL = 'cancel',
}

@Entity('posts')
export class Post {
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
    type: 'datetime',
    default: () => 'NOW()',
  })
  update_at: string;

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

  @Column({
    type: 'enum',
    enum: StatusPost,
    default: StatusPost.PENDING,
  })
  status: StatusPost;

  @Column({
    default: '',
    nullable: false,
  })
  title: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
