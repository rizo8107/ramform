import { supabase } from '../lib/supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      fullName: data.user.user_metadata?.full_name || '',
      role: data.user.user_metadata?.role || 'admin',
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || '',
      role: user.user_metadata?.role || 'admin',
    };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || '',
          role: session.user.user_metadata?.role || 'admin',
        });
      } else {
        callback(null);
      }
    });
  },
};
