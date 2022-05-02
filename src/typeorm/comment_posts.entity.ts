import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './index';
import { Post } from './index';

@Entity('comment_posts')
export class CommentPost {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  create_at: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Column({
    nullable: false,
    default: '',
  })
  content_texts: string;

  @Column({
    nullable: true,
    default: '',
  })
  content_images: string;
}
