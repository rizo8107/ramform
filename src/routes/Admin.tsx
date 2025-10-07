import { useEffect, useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import { authService, type AuthUser } from '../services/authService';

export default function Admin() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) setCurrentUser(user);
      setIsCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin onLoginSuccess={() => undefined} />;
  }

  return <AdminDashboard onLogout={() => undefined} />;
}
