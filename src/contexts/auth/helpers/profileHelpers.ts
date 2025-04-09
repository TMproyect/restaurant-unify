
import { AuthUser, UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Function to fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log("Fetching user profile for ID:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (data) {
      console.log("Profile data:", data);
      return {
        id: (data as any).id,
        name: (data as any).name,
        email: '', // Email will be fetched separately since it's not in the profiles table
        role: (data as any).role as UserRole,
        avatar: (data as any).avatar || null,
        created_at: (data as any).created_at
      };
    } else {
      console.log("No profile found for ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

// Function to fetch all user profiles from Supabase
export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    console.log("Fetching all user profiles");
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, avatar, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }

    if (data) {
      console.log("Fetched profiles:", data.length);
      return data.map(profile => ({
        id: (profile as any).id,
        name: (profile as any).name,
        email: '', // Email will be fetched separately
        role: (profile as any).role as UserRole,
        avatar: (profile as any).avatar || null,
        created_at: (profile as any).created_at
      }));
    } else {
      console.log("No profiles found");
      return [];
    }
  } catch (error) {
    console.error("Unexpected error fetching profiles:", error);
    return [];
  }
};

// Function to create a user profile in the profiles table
export const createUserProfile = async (userId: string, profileData: Partial<AuthUser>) => {
  try {
    console.log("Creating user profile for ID:", userId, "with data:", profileData);
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
        },
      ]);

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

    console.log("Profile created successfully");
    return data;
  } catch (error: any) {
    console.error("Error in createUserProfile:", error.message);
    throw error;
  }
};
