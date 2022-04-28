import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
const entities = [User];

export abstract class BaseEntity {
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

export { User };

export default entities;
