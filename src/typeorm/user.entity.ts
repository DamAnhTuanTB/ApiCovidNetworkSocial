import { Entity, Column } from 'typeorm';
import { BaseEntity } from '.';

export enum UserRole {
  ADMIN = 'admin',
  EXPERT = 'expert',
  PATIENT = 'patient',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({
    nullable: false,
    default: '',
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  @Column({
    nullable: true,
  })
  nick_name: string;

  @Column({
    nullable: false,
    default: '',
  })
  first_name: string;

  @Column({
    nullable: false,
    default: '',
  })
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({
    type: 'date',
    nullable: true,
  })
  date_of_birth: string;

  @Column({
    default: 'string',
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  telephone: string;

  @Column({
    type: 'boolean',
    default: null,
  })
  is_active: boolean;
}
