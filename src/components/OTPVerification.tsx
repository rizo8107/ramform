import React, { useEffect, useState } from 'react';
import { Phone, ArrowRight, MessageCircle } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import TwoLeavesLogo from './TwoLeavesLogo';
import { translations, Language } from '../utils/translations';
import { whatsappService } from '../services/whatsappAPI';
import { membershipService } from '../services/membershipService';

interface OTPVerificationProps {
  onVerificationSuccess: (phoneNumber: string) => void;
}

export default function OTPVerification({ onVerificationSuccess }: OTPVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language');
      return (saved === 'ta' || saved === 'en') ? (saved as Language) : 'ta';
    } catch {
      return 'ta';
    }
  });
  // reCAPTCHA v3 state
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const RECAPTCHA_SITE_KEY = '6LdT9uQrAAAAAPOHRKp9XUdI82kBXGgFIodvbDIz';

  const t = translations[language];

  // Persist language selection
  useEffect(() => {
    try {
      localStorage.setItem('app_language', language);
    } catch (e) {
      console.debug('localStorage unavailable, language not persisted', e);
    }
  }, [language]);

  // One-time migration to default Tamil on first visit
  useEffect(() => {
    try {
      const migrated = localStorage.getItem('lang_migrated_to_ta_default');
      if (!migrated) {
        setLanguage('ta');
        localStorage.setItem('lang_migrated_to_ta_default', 'true');
      }
    } catch (e) {
      console.debug('localStorage unavailable for migration', e);
    }
  }, []);

  // Load Google reCAPTCHA v3
  useEffect(() => {
    const scriptId = 'recaptcha-script';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaReady(true);
    document.body.appendChild(script);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSendingOTP(true);
    
    try {
      // Execute reCAPTCHA v3 and get token (avoid state race on first run)
      let token = '';
      // @ts-expect-error grecaptcha is injected by the script
      if (recaptchaReady && window.grecaptcha) {
        token = await new Promise<string>((resolve) => {
          // @ts-expect-error grecaptcha global
          window.grecaptcha.ready(() => {
            // @ts-expect-error grecaptcha global
            window.grecaptcha
              .execute(RECAPTCHA_SITE_KEY, { action: 'send_otp' })
              .then((t: string) => resolve(t))
              .catch((err: unknown) => {
                console.error('reCAPTCHA execute failed:', err);
                resolve('');
              });
          });
        });
      }
      if (!token) {
        setError('reCAPTCHA validation failed. Please try again.');
        setIsSendingOTP(false);
        return;
      }
      // Check if phone number is already registered
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Check both with and without country code to handle existing data
      const existingCheck = await membershipService.getApplicationByPhone(cleanPhoneNumber);
      if (existingCheck.success && existingCheck.application) {
        setError('ALREADY_REGISTERED');
        setIsSendingOTP(false);
        return;
      }
      
      const result = await whatsappService.sendOTP(phoneNumber);
      
      if (result.success) {
        setShowOTPInput(true);
        // For demo purposes, show the OTP in console
        if (result.otp) {
          console.log('Demo OTP for testing:', result.otp);
        }
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error in handleSendOTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    
    try {
      const result = await whatsappService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        onVerificationSuccess(phoneNumber);
      } else {
        setError(result.error || t.invalidOTP);
        setOtp('');
      }
    } catch (err) {
      console.error('Error in handleVerifyOTP:', err);
      setError('Verification failed. Please try again.');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TwoLeavesLogo className="h-20 w-20 text-green-600" />
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      <div className="px-4 py-1">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            {/* Leaders Banner */}
            <div className="mb-0.1">
              <img 
                src="/Leaders banner.webp" 
                alt="AIADMK Leaders" 
                className="h-48 w-auto mx-auto object-contain"
                loading="lazy"
                decoding="async"
                height={192}
              />
            </div>
            
            {/* AIADMK Logo */}
            <div className="mb-4">
              <img 
                src="/LOGO amdmk.webp" 
                alt="AIADMK Logo" 
                className="h-50 w-auto mx-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* Badge removed */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t.becomeAMember}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {t.joinDescription}
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {showOTPInput ? (
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Phone className="h-8 w-8 text-green-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {showOTPInput ? 'WhatsApp Verification' : t.mobileVerification}
                </h2>
                <p className="text-gray-600">
                  {showOTPInput ? 'Please enter the OTP sent to your WhatsApp' : t.enterMobileToGetStarted}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {error === 'ALREADY_REGISTERED' ? (
                    <div className="text-red-600 text-sm space-y-1">
                      <p>You have already registered with this phone number.</p>
                      <p>இந்த தொலைபேசி எண்ணுடன் நீங்கள் ஏற்கனவே பதிவு செய்துள்ளீர்கள்.</p>
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                </div>
              )}

              {!showOTPInput ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.mobileNumber} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder={t.enterMobile}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOTP || phoneNumber.length !== 10 || !recaptchaReady}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSendingOTP ? 'Sending WhatsApp OTP...' : 'Send WhatsApp OTP'}
                    {!isSendingOTP && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.enterOTP}
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-center text-lg tracking-widest"
                      placeholder={t.enterOTPPlaceholder}
                      required
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      OTP sent to WhatsApp: {phoneNumber}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify WhatsApp OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPInput(false);
                      setOtp('');
                      setPhoneNumber('');
                    }}
                    className="w-full text-green-600 hover:text-green-700 font-medium py-2 transition-colors"
                  >
                    {t.changePhoneNumber}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}