import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface MembershipApplication {
  id?: string;
  phone_number: string;
  alternate_phone_number?: string;
  name: string;
  email?: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  revenue_district: string;
  assembly_constituency: string;
  education: 'Arts & Science' | 'Engineering' | 'Law' | 'Medicine' | 'Management';
  specialization?: string;
  occupation: string;
  address?: string;
  is_already_member: boolean;
  want_to_volunteer: boolean;
  want_to_join_and_volunteer: boolean;
  motivation: string;
  application_status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  submitted_at?: string;
  updated_at?: string;
}

export interface OTPVerification {
  id?: string;
  phone_number: string;
  otp_code: string;
  is_verified: boolean;
  expires_at: string;
  created_at?: string;
}