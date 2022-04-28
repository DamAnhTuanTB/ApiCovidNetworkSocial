import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
const entities = [User, Post];

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

export { User, Post };

export default entities;
