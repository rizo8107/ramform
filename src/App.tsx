import { useState } from 'react';
import OTPVerification from './components/OTPVerification';
import MembershipForm from './components/MembershipForm';
function App() {
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');

  const handlePhoneVerification = (phoneNumber: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    setIsPhoneVerified(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <main className="flex-1">
        {!isPhoneVerified ? (
          <OTPVerification onVerificationSuccess={handlePhoneVerification} />
        ) : (
          <div className="App">
            <MembershipForm phoneNumber={verifiedPhoneNumber} />
          </div>
        )}
      </main>
      <footer className="mt-8 bg-white/70 backdrop-blur border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
          <p>
            © {new Date().getFullYear()} AIADMK. All rights reserved.
          </p>
          <p className="mt-1">
            For support, contact <a href="mailto:support@aiadmk.example" className="underline">support@aiadmk.example</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;