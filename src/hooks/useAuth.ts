import { useAuthStore } from '@/features/auth/store';
import { useLogout } from '@/features/auth/api/auth.queries';

export function useAuth() {
  const { user, token, isAuthenticated } = useAuthStore();
  const logout = useLogout();

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin' || user?.role === 'owner',
    isOwner: user?.role === 'owner',
    logout,
  };
}
