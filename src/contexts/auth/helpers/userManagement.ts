
import { UserRole } from '../types';
import { supabase } from '@/integrations/supabase/client';

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
