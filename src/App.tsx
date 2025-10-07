import React, { useState, useEffect } from 'react';
import OTPVerification from './components/OTPVerification';
import MembershipForm from './components/MembershipForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { authService, AuthUser } from './services/authService';

type ViewMode = 'public' | 'admin-login' | 'admin-dashboard';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setViewMode('admin-dashboard');
      }
      setIsCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (user) {
        setViewMode('admin-dashboard');
      } else {
        setViewMode('public');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePhoneVerification = (phoneNumber: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    setIsPhoneVerified(true);
  };

  const handleAdminAccess = () => {
    setViewMode('admin-login');
  };

  const handleLoginSuccess = () => {
    setViewMode('admin-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('public');
    setIsPhoneVerified(false);
    setVerifiedPhoneNumber('');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (viewMode === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (viewMode === 'admin-dashboard' && currentUser) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (!isPhoneVerified) {
    return (
      <div>
        <div className="absolute top-4 right-4">
          <button
            onClick={handleAdminAccess}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Admin Login
          </button>
        </div>
        <OTPVerification onVerificationSuccess={handlePhoneVerification} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleAdminAccess}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Admin Login
        </button>
      </div>
      <MembershipForm phoneNumber={verifiedPhoneNumber} />
    </div>
  );
}

export default App;