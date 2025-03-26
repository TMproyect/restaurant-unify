
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './types';
import { toast } from 'sonner';

// Fetch user profile data
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

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
    if (error.message.includes('Email not confirmed')) {
      toast.error('Error al iniciar sesión: El correo electrónico no ha sido confirmado');
    } else {
      toast.error('Error al iniciar sesión: ' + error.message);
    }
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
    if (error.message.includes('rate limit')) {
      toast.error('Por motivos de seguridad, debe esperar 32 segundos antes de intentar nuevamente');
    } else {
      toast.error('Error al crear la cuenta: ' + error.message);
    }
    throw error;
  }

  return data;
};

// Create profile helper
export const createUserProfile = async (userId: string, name: string, role: UserRole) => {
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

// Create user helper - Admin function
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
    },
  });

  if (error) {
    console.error('Create user error:', error.message);
    toast.error('Error al crear el usuario: ' + error.message);
    throw error;
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
