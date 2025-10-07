import React, { useState } from 'react';
import { Calendar, MapPin, User, Mail, Phone, Check } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import OTPVerification from './OTPVerification';
import TwoLeavesLogo from './TwoLeavesLogo';
import { translations, Language } from '../utils/translations';
import { membershipService } from '../services/membershipService';
import { MembershipApplication } from '../lib/supabase';

interface MembershipFormProps {
  phoneNumber: string;
}

interface FormData {
  name: string;
  whatsapp: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  revenueDistrict: string;
  assemblyConstituency: string;
  education: string;
  specialization: string;
  occupation: string;
  address: string;
  isAlreadyMember: string;
  wantToVolunteer: string;
  wantToJoinAndVolunteer: string;
  motivation: string;
  agreeTerms: boolean;
}

const revenueDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

const assemblyConstituencies: Record<string, string[]> = {
  'Ariyalur': ['Ariyalur', 'Andimadam', 'Sendurai'],
  'Chengalpattu': ['Chengalpattu', 'Thiruporur', 'Cheyyur'],
  'Chennai': ['Chennai Central', 'Chennai North', 'Chennai South', 'T. Nagar', 'Mylapore'],
  'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Singanallur', 'Sulur'],
  'Cuddalore': ['Cuddalore', 'Panruti', 'Vriddachalam'],
  'Dharmapuri': ['Dharmapuri', 'Palacode', 'Pennagaram'],
  'Dindigul': ['Dindigul', 'Natham', 'Nilakottai'],
  'Erode': ['Erode East', 'Erode West', 'Modakkurichi'],
  'Kallakurichi': ['Kallakurichi', 'Chinnaselam', 'Rishivandinam'],
  'Kanchipuram': ['Kanchipuram', 'Arakkonam', 'Sholinghur'],
  'Kanyakumari': ['Kanyakumari', 'Nagercoil', 'Colachel'],
  'Karur': ['Karur', 'Krishnarayapuram', 'Manapparai'],
  'Krishnagiri': ['Krishnagiri', 'Hosur', 'Uthangarai'],
  'Madurai': ['Madurai Central', 'Madurai East', 'Madurai West', 'Madurai North'],
  'Mayiladuthurai': ['Mayiladuthurai', 'Sirkazhi', 'Poompuhar'],
  'Nagapattinam': ['Nagapattinam', 'Kilvelur', 'Vedaranyam'],
  'Namakkal': ['Namakkal', 'Rasipuram', 'Senthamangalam'],
  'Nilgiris': ['Udagamandalam', 'Gudalur', 'Coonoor'],
  'Perambalur': ['Perambalur', 'Kunnam', 'Alathur'],
  'Pudukkottai': ['Pudukkottai', 'Thirumayam', 'Alangudi'],
  'Ramanathapuram': ['Ramanathapuram', 'Mudukulathur', 'Paramakudi'],
  'Ranipet': ['Ranipet', 'Arcot', 'Sholingur'],
  'Salem': ['Salem North', 'Salem South', 'Salem West', 'Attur'],
  'Sivaganga': ['Sivaganga', 'Manamadurai', 'Tiruppattur'],
  'Tenkasi': ['Tenkasi', 'Alangulam', 'Kadayanallur'],
  'Thanjavur': ['Thanjavur', 'Thiruvidaimarudur', 'Kumbakonam'],
  'Theni': ['Theni', 'Bodinayakanur', 'Periyakulam'],
  'Thoothukudi': ['Thoothukudi', 'Tiruchendur', 'Srivaikuntam'],
  'Tiruchirappalli': ['Tiruchirappalli East', 'Tiruchirappalli West', 'Srirangam'],
  'Tirunelveli': ['Tirunelveli', 'Nanguneri', 'Radhapuram'],
  'Tirupathur': ['Tirupathur', 'Ambur', 'Natrampalli'],
  'Tiruppur': ['Tiruppur North', 'Tiruppur South', 'Palladam'],
  'Tiruvallur': ['Tiruvallur', 'Ponneri', 'Gummidipoondi'],
  'Tiruvannamalai': ['Tiruvannamalai', 'Kilpennathur', 'Kalasapakkam'],
  'Tiruvarur': ['Tiruvarur', 'Mannargudi', 'Nannilam'],
  'Vellore': ['Vellore', 'Katpadi', 'Gudiyatham'],
  'Viluppuram': ['Viluppuram', 'Tindivanam', 'Vanur'],
  'Virudhunagar': ['Virudhunagar', 'Sivakasi', 'Srivilliputhur']
};

export default function MembershipForm({ phoneNumber }: MembershipFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    whatsapp: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    revenueDistrict: '',
    assemblyConstituency: '',
    education: '',
    specialization: '',
    occupation: '',
    address: '',
    isAlreadyMember: '',
    wantToVolunteer: '',
    wantToJoinAndVolunteer: '',
    motivation: '',
    agreeTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset dependent fields
        ...(name === 'revenueDistrict' ? { assemblyConstituency: '' } : {}),
        ...(name === 'education' && !['UG', 'PG'].includes(value) ? { specialization: '' } : {})
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDuplicateError('');
    
    try {
      // Check if phone number already exists
      const existingCheck = await membershipService.getApplicationByPhone(phoneNumber);
      if (existingCheck.success && existingCheck.application) {
        const errorMessage = language === 'en' 
          ? 'You have already registered with this phone number.'
          : 'இந்த தொலைபேசி எண்ணுடன் நீங்கள் ஏற்கனவே பதிவு செய்துள்ளீர்கள்.';
        setDuplicateError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Prepare application data
      const applicationData: Omit<MembershipApplication, 'id' | 'submitted_at' | 'updated_at'> = {
        phone_number: phoneNumber,
        name: formData.name,
        email: formData.email || undefined,
        gender: formData.gender as 'Male' | 'Female',
        date_of_birth: formData.dateOfBirth,
        revenue_district: formData.revenueDistrict,
        assembly_constituency: formData.assemblyConstituency,
        education: formData.education as 'No Education' | '10th' | '12th' | 'UG' | 'PG',
        specialization: formData.specialization || undefined,
        occupation: formData.occupation,
        address: formData.address || undefined,
        is_already_member: formData.isAlreadyMember === 'Yes',
        want_to_volunteer: formData.wantToVolunteer === 'Yes',
        want_to_join_and_volunteer: formData.wantToJoinAndVolunteer === 'Yes',
        motivation: formData.motivation
      };

      // Submit to database
      const result = await membershipService.submitApplication(applicationData);
      
      if (result.success) {
        console.log('Application submitted successfully:', result.applicationId);
        setIsSubmitted(true);
      } else {
        console.error('Application submission failed:', result.error);
        const errorMessage = language === 'en'
          ? `Application submission failed: ${result.error}`
          : `விண்ணப்பம் சமர்பிக்க முடியவில்லை: ${result.error}`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = language === 'en'
        ? 'An error occurred while submitting your application. Please try again.'
        : 'உங்கள் விண்ணப்பத்தை சமர்பிக்கும் போது பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.applicationSubmitted}</h2>
          <p className="text-sm text-gray-500">
            {t.thankYou}
          </p>
        </div>
      </div>
    );
  }

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

      <div className="px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            {/* Leaders Banner */}
            <div className="mb-6">
              <img 
                src="/Leaders banner.png" 
                alt="AIADMK Leaders" 
                className="h-48 w-auto mx-auto object-contain"
              />
            </div>
            
            {/* AIADMK Logo */}
            <div className="mb-4">
              <img 
                src="/LOGO amdmk.webp" 
                alt="AIADMK Logo" 
                className="h-50 w-auto mx-auto object-contain"
              />
            </div>
            
            <div className="inline-block bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-medium mb-6">
              {t.joinMovement}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Become a Member of <span className="text-green-600">AIADMK</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              {t.joinDescription}
            </p>
            <div className="bg-green-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg">
              {t.joinMovementToday}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Phone Number (Read-only, already verified) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.mobileNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    className="w-full px-4 py-3 border border-green-500 bg-green-50 rounded-lg cursor-not-allowed"
                    readOnly
                  />
                  <div className="absolute right-3 top-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-1">{t.phoneVerified}</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t.enterEmail}
                />
              </div>

              {/* Gender and Date of Birth */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.gender} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectGender}</option>
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dateOfBirth} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.revenueDistrict} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="revenueDistrict"
                    value={formData.revenueDistrict}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectDistrict}</option>
                    {revenueDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.assemblyConstituency} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assemblyConstituency"
                    value={formData.assemblyConstituency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.revenueDistrict}
                  >
                    <option value="">{t.selectConstituency}</option>
                    {formData.revenueDistrict && assemblyConstituencies[formData.revenueDistrict]?.map(constituency => (
                      <option key={constituency} value={constituency}>{constituency}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Education */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.education} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectEducation}</option>
                    <option value="No Education">No Education</option>
                    <option value="10th">{t.grade10}</option>
                    <option value="12th">{t.grade12}</option>
                    <option value="UG">{t.ug}</option>
                    <option value="PG">{t.pg}</option>
                  </select>
                </div>

                {['UG', 'PG'].includes(formData.education) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.specialization}
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">{t.selectSpecialization}</option>
                      <option value="Doctor">{t.doctor}</option>
                      <option value="Engineer">{t.engineer}</option>
                      <option value="Arts & Science">{t.artsScience}</option>
                      <option value="Management">{t.management}</option>
                      <option value="Others">{t.others}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Occupation</option>
                  <option value="Student">{t.student}</option>
                  <option value="Private">{t.privateEmployed}</option>
                  <option value="Government">{t.governmentEmployed}</option>
                  <option value="Self Employed">{t.selfEmployed}</option>
                  <option value="Business">{t.business}</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Home Maker">{t.homeMaker}</option>
                </select>
              </div>

              {/* Membership Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you already a member of our party? <span className="text-red-500">*</span>
                </label>
                <select
                  name="isAlreadyMember"
                  value={formData.isAlreadyMember}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">{t.yes}</option>
                  <option value="No">{t.no}</option>
                </select>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you want to join? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Tell us about your motivation to join AIADMK..."
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the terms and conditions and privacy policy. I confirm that all provided information is accurate.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isSubmitting ? t.submittingApplication : 'Submit Application'}
              </button>

              {/* Footer Note */}
              <p className="text-center text-sm text-gray-500 mt-6 leading-relaxed">
                By joining, you'll be part of a historic movement dedicated to Tamil Nadu's development and prosperity.
              </p>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-6 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">© 2025 AIADMK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}