import { supabase } from '../lib/supabase';

export interface MembershipApplication {
  id: string;
  phone_number: string;
  name: string;
  email: string | null;
  gender: string;
  date_of_birth: string;
  revenue_district: string;
  assembly_constituency: string;
  education: string;
  specialization: string | null;
  occupation: string;
  address: string | null;
  is_already_member: boolean;
  want_to_volunteer: boolean;
  want_to_join_and_volunteer: boolean;
  motivation: string;
  application_status: string;
  submitted_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}

export const adminService = {
  async getAllApplications(): Promise<MembershipApplication[]> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async getApplicationStats(): Promise<ApplicationStats> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('application_status');

    if (error) {
      throw new Error(error.message);
    }

    const stats: ApplicationStats = {
      total: data.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      under_review: 0,
    };

    data.forEach((app) => {
      switch (app.application_status) {
        case 'pending':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'under_review':
          stats.under_review++;
          break;
      }
    });

    return stats;
  },

  async updateApplicationStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'under_review'
  ): Promise<void> {
    const { error } = await supabase
      .from('membership_applications')
      .update({ application_status: status })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async searchApplications(searchTerm: string): Promise<MembershipApplication[]> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async filterApplicationsByStatus(status: string): Promise<MembershipApplication[]> {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('*')
      .eq('application_status', status)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },
};
