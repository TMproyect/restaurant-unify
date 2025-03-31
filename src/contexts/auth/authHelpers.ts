
import { AuthUser, UserRole } from './types';
import { supabase } from '@/integrations/supabase/client';

// Function to fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log("Fetching user profile for ID:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, avatar, created_at')
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
        email: (data as any).email || '',
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
      .select('id, name, email, role, avatar, created_at')
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
        email: (profile as any).email || '',
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

// Function to create a user by admin with Supabase auth
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  try {
    console.log("Creating user by admin with email:", email, "role:", role);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        role,
      },
    });

    if (error) {
      console.error("Admin create user error:", error);
      throw error;
    }

    console.log("Admin create user successful, user ID:", data.user?.id);
    return data;
  } catch (error: any) {
    console.error("Error in createUserByAdmin:", error.message);
    throw error;
  }
};

// Function to update a user role by ID
export const updateUserRoleById = async (userId: string, newRole: UserRole) => {
  try {
    console.log("Updating user role for ID:", userId, "to role:", newRole);
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }

    console.log("User role updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error in updateUserRoleById:", error.message);
    return false;
  }
};

// Function to log out a user
export const logoutUser = async () => {
  try {
    console.log("Logging out user");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      throw error;
    }

    console.log("Logout successful");
  } catch (error: any) {
    console.error("Error in logoutUser:", error.message);
    throw error;
  }
};

// Function to validate and adjust role if necessary
export const validateUserRole = (role?: string): UserRole => {
  // Default roles mapping from English to Spanish
  const roleMapping: Record<string, UserRole> = {
    'admin': 'admin',
    'waiter': 'mesero',
    'kitchen': 'cocina',
    'delivery': 'repartidor',
    'manager': 'gerente',
    'owner': 'propietario'
  };

  // First check if it's already a valid Spanish role
  if (role && ['admin', 'gerente', 'mesero', 'cocina', 'repartidor', 'propietario'].includes(role)) {
    return role as UserRole;
  }

  // Then check if it's an English role that needs translation
  if (role && roleMapping[role]) {
    console.log(`Translating role from '${role}' to '${roleMapping[role]}'`);
    return roleMapping[role];
  }

  // Default to admin if invalid/undefined
  console.warn(`Invalid or undefined role: ${role}, defaulting to 'admin'`);
  return 'admin';
};

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
