
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './types';
import { toast } from 'sonner';

// Fetch user profile data
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('Fetching profile for user:', userId);
    
    // Add a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    clearTimeout(timeoutId);

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
    
    console.log('Profile data found:', data);
    
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
  try {
    console.log('Attempting to login with email:', email);
    
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
    // Use a simple direct login approach for reliability
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error from Supabase:', error.message);
      throw error;
    }

    if (!data || !data.user) {
      console.error('No user returned from login');
      throw new Error('No se pudo iniciar sesión');
    }

    console.log('Supabase login successful, user ID:', data.user.id);
    console.log('Session exists:', !!data.session);
    
    return data;
  } catch (error) {
    console.error('Error in loginUser helper function:', error);
    throw error;
  }
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
      emailRedirectTo: `${window.location.origin}/login`,
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

// Crear usuario sin usar admin API
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  console.log('Creating new user with role:', role);
  
  // En lugar de usar la API admin, usamos el registro normal
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
      emailRedirectTo: `${window.location.origin}/login`,
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
  console.log('Updating user role:', userId, 'to', newRole);
  
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
  console.log('Logging out user');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error.message);
    throw error;
  }
  console.log('Logout successful');
};
