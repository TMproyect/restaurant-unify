
import { UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Function to sign up a user with Supabase auth
export const signupUser = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  try {
    console.log("Signing up user with email:", email, "role:", role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    console.log("Signup successful, user ID:", data.user?.id);
    return data;
  } catch (error: any) {
    console.error("Error in signupUser:", error.message);
    throw error;
  }
};

// Function to create a user with edge function
export const createUserWithEdgeFunction = async (email: string, password: string, name: string, role: UserRole) => {
  try {
    console.log("Invoking create-user-with-profile edge function with params:", { email, password, name, role });
    const { data, error } = await supabase.functions.invoke('create-user-with-profile', {
      body: {
        email,
        password,
        name,
        role
      }
    });

    if (error) {
      console.error("Error from edge function:", error);
      return { error };
    }

    console.log("Edge function returned:", data);
    return data;

  } catch (error: any) {
    console.error("Error calling edge function:", error);
    return { error: error.message };
  }
};
