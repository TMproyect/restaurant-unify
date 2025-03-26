
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './types';
import { toast } from 'sonner';

// Fetch user profile data
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      console.error('No profile data found for user:', userId);
      return null;
    }

    const sessionResponse = await supabase.auth.getSession();
    const email = sessionResponse.data.session?.user?.email || '';

    return {
      id: data.id,
      name: data.name,
      email: email,
      role: data.role as UserRole,
      avatar: data.avatar,
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Login helper
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    throw error;
  }

  return data;
};

// Signup helper
export const signupUser = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Signup error:', error.message);
    throw error;
  }

  return data;
};

// Create profile helper
export const createUserProfile = async (userId: string, name: string, role: UserRole) => {
  console.log('Creating user profile for:', userId, name, role);
  const { error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        name,
        role,
      }
    ]);

  if (error) {
    console.error('Error creating profile:', error);
    toast.error('Error al crear el perfil de usuario: ' + error.message);
    throw error;
  }
};

// Modificado: Crear usuario sin usar admin API
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  // En lugar de usar la API admin, usamos el registro normal
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Create user error:', error.message);
    toast.error('Error al crear el usuario: ' + error.message);
    throw error;
  }

  // En un entorno real, necesitaríamos una función edge para esto
  // pero por ahora simplemente creamos el perfil para el usuario
  if (data.user) {
    try {
      await createUserProfile(data.user.id, name, role);
    } catch (profileError) {
      console.error('Error creating profile after signup:', profileError);
    }
  }

  return data;
};

// Update user role helper
export const updateUserRoleById = async (userId: string, newRole: UserRole) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error('Update role error:', error.message);
    toast.error('Error al actualizar el rol: ' + error.message);
    throw error;
  }
};

// Logout helper
export const logoutUser = async () => {
  await supabase.auth.signOut();
};
