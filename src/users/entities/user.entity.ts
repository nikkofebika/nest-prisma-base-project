import { UserType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  role_id: number;
  name: string;
  email: string;
  email_verivied_at: Date;
  type: UserType;
  created_at: Date;
  created_by: number;
  updated_at: Date;
  updated_by: number;
  deleted_at: Date;
  deleted_by: number;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
