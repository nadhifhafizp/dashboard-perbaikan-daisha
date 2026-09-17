export type UserRole = 'ADMIN' | 'OPERATOR' | 'USER_SEKSI';

export interface UserAccount {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  seksi?: string | null;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SessionPayload {
  username: string;
  role: UserRole;
  name: string;
}
