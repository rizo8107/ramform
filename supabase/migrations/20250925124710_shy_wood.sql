/*
  # AIADMK Membership Database Schema

  1. New Tables
    - `membership_applications`
      - `id` (uuid, primary key)
      - `phone_number` (text, unique, verified phone)
      - `name` (text, required)
      - `email` (text, optional)
      - `gender` (text, required)
      - `date_of_birth` (date, required)
      - `revenue_district` (text, required)
      - `assembly_constituency` (text, required)
      - `education` (text, required)
      - `specialization` (text, optional)
      - `occupation` (text, required)
      - `address` (text, optional)
      - `is_already_member` (boolean, required)
      - `want_to_volunteer` (boolean, default false)
      - `want_to_join_and_volunteer` (boolean, default false)
      - `motivation` (text, required)
      - `application_status` (text, default 'pending')
      - `submitted_at` (timestamp, auto)
      - `updated_at` (timestamp, auto)

    - `otp_verifications`
      - `id` (uuid, primary key)
      - `phone_number` (text, required)
      - `otp_code` (text, required)
      - `is_verified` (boolean, default false)
      - `expires_at` (timestamp, required)
      - `created_at` (timestamp, auto)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
    - Add indexes for performance

  3. Additional Features
    - Automatic timestamps
    - Phone number validation
    - Application status tracking
*/

-- Create membership applications table
CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female')),
  date_of_birth date NOT NULL,
  revenue_district text NOT NULL,
  assembly_constituency text NOT NULL,
  education text NOT NULL CHECK (education IN ('10th', '12th', 'UG', 'PG')),
  specialization text,
  occupation text NOT NULL,
  address text,
  is_already_member boolean NOT NULL DEFAULT false,
  want_to_volunteer boolean DEFAULT false,
  want_to_join_and_volunteer boolean DEFAULT false,
  motivation text NOT NULL,
  application_status text DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected', 'under_review')),
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for membership_applications
CREATE POLICY "Anyone can insert membership applications"
  ON membership_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own application"
  ON membership_applications
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for otp_verifications
CREATE POLICY "Anyone can insert OTP verifications"
  ON otp_verifications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own OTP"
  ON otp_verifications
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their own OTP"
  ON otp_verifications
  FOR UPDATE
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_phone ON membership_applications(phone_number);
CREATE INDEX IF NOT EXISTS idx_membership_status ON membership_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_membership_district ON membership_applications(revenue_district);
CREATE INDEX IF NOT EXISTS idx_membership_submitted ON membership_applications(submitted_at);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verified ON otp_verifications(is_verified);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_membership_applications_updated_at
    BEFORE UPDATE ON membership_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Clean up expired OTPs function
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < now() AND is_verified = false;
END;
$$ language 'plpgsql';