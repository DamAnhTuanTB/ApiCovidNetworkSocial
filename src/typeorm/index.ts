import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { LikePost } from './like_posts.entity';
import { CommentPost } from './comment_posts.entity';
import { SavePost } from './save_posts.entity';
import { LikeComment } from './like_comments.entity';
import { ChatSession } from './chat_sessions.entity';
import { Message } from './messages.entity';
import { Notification } from './notification.entity';
const entities = [
  User,
  Post,
  LikePost,
  CommentPost,
  SavePost,
  LikeComment,
  ChatSession,
  Message,
  Notification,
];

export class BaseEntity {
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
}

export {
  User,
  Post,
  LikePost,
  CommentPost,
  SavePost,
  LikeComment,
  ChatSession,
  Message,
  Notification,
};

export default entities;
