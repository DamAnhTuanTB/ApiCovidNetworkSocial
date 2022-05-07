import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CommentPost } from './comment_posts.entity';
import { User } from './index';
import { Post } from './index';

@Entity('like_comments')
export class LikeComment {
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

  @ManyToOne(() => CommentPost, { onDelete: 'CASCADE' })
  comment: CommentPost;
}
