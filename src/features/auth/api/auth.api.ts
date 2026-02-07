import { api } from '@/lib/axios';
import type {
  LoginInput,
  AuthResponse,
  User,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../types';

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/login', input);
    return data;
  },

  getMe: async (): Promise<{ data: User }> => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },

  updateProfile: async (input: UpdateProfileInput): Promise<{ data: User }> => {
    const { data } = await api.put('/api/auth/me', input);
    return data;
  },

  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    await api.put('/api/auth/password', input);
  },
};
