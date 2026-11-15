import { Role, type User } from '@prisma/client';

export class UserEntity {
  id: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.verified = user.verified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
