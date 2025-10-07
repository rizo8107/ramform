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

  if (!isPhoneVerified) {
    return (
      <div>
        <OTPVerification onVerificationSuccess={handlePhoneVerification} />
      </div>
    );
  }

  return (
    <div className="App">
      <MembershipForm phoneNumber={verifiedPhoneNumber} />
    </div>
  );
}

export default App;