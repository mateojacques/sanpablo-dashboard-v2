export type UserRole = 'owner' | 'admin' | 'buyer' | 'partner';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

export type AuthResponse = {
  data: {
    token: string;
    user: User;
  };
};

export type UpdateProfileInput = {
  fullName?: string;
  email?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
