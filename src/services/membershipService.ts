import { supabase, MembershipApplication, OTPVerification } from '../lib/supabase';

class MembershipService {
  // Store OTP in database instead of localStorage
  async storeOTP(phoneNumber: string, otpCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clean phone number
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`;
      
      // Set expiration time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      // Delete any existing OTPs for this phone number
      await supabase
        .from('otp_verifications')
        .delete()
        .eq('phone_number', formattedPhoneNumber);
      
      // Insert new OTP
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: formattedPhoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt,
          is_verified: false
        });

      if (error) {
        console.error('Error storing OTP:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in storeOTP:', error);
      return { success: false, error: 'Failed to store OTP' };
    }
  }

  // Verify OTP from database
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`;
      
      // Get OTP from database
      const { data: otpData, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', formattedPhoneNumber)
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpData) {
        return { success: false, error: 'OTP not found. Please request a new OTP.' };
      }

      // Check if OTP is expired
      const now = new Date();
      const expiresAt = new Date(otpData.expires_at);
      
      if (now > expiresAt) {
        // Delete expired OTP
        await supabase
          .from('otp_verifications')
          .delete()
          .eq('id', otpData.id);
        
        return { success: false, error: 'OTP has expired. Please request a new one.' };
      }

      // Verify OTP
      if (otpData.otp_code === enteredOTP) {
        // Mark OTP as verified
        await supabase
          .from('otp_verifications')
          .update({ is_verified: true })
          .eq('id', otpData.id);
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid OTP. Please try again.' };
      }

    } catch (error) {
      console.error('Error in verifyOTP:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  // Submit membership application
  async submitApplication(applicationData: Omit<MembershipApplication, 'id' | 'submitted_at' | 'updated_at'>): Promise<{ success: boolean; applicationId?: string; error?: string }> {
    try {
      // Check if application already exists for this phone number
      const { data: existingApp, error: checkError } = await supabase
        .from('membership_applications')
        .select('id')
        .eq('phone_number', applicationData.phone_number)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing application:', checkError);
        return { success: false, error: checkError.message };
      }

      if (existingApp) {
        return { success: false, error: 'An application already exists for this phone number.' };
      }

      // Insert new application
      const { data, error } = await supabase
        .from('membership_applications')
        .insert(applicationData)
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        return { success: false, error: error.message };
      }

      return { success: true, applicationId: data.id };
    } catch (error) {
      console.error('Error in submitApplication:', error);
      return { success: false, error: 'Failed to submit application' };
    }
  }

  // Get application by phone number
  async getApplicationByPhone(phoneNumber: string): Promise<{ success: boolean; application?: MembershipApplication; error?: string }> {
    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      // Check for both formats to handle existing data inconsistencies
      const { data, error } = await supabase
        .from('membership_applications')
        .select('*')
        .or(`phone_number.eq.${cleanPhoneNumber},phone_number.eq.91${cleanPhoneNumber}`)
        .limit(1);

      if (error) {
        console.error('Error fetching application:', error);
        return { success: false, error: error.message };
      }

      return { success: true, application: data?.[0] || undefined };
    } catch (error) {
      console.error('Error in getApplicationByPhone:', error);
      return { success: false, error: 'Failed to fetch application' };
    }
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await supabase.rpc('cleanup_expired_otps');
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export const membershipService = new MembershipService();
export default MembershipService;