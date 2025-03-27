
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
    const email = sessionResponse.data.session?.user?.id === userId 
      ? sessionResponse.data.session?.user?.email || ''
      : '';
    
    console.log('Profile data found:', data);
    
    return {
      id: data.id,
      name: data.name,
      email: email,
      role: data.role as UserRole,
      avatar: data.avatar,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Fetch all user profiles with improved reliability
export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    console.log('Fetching all profiles...');
    
    // First get all profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error fetching all profiles:', profilesError);
      return [];
    }

    if (!profilesData || profilesData.length === 0) {
      console.warn('No profiles found in database');
      return [];
    }
    
    console.log('Fetched profiles:', profilesData.length, profilesData);
    
    // Get current user's session to extract their email
    const sessionResponse = await supabase.auth.getSession();
    const currentUserEmail = sessionResponse.data.session?.user?.email;
    const currentUserId = sessionResponse.data.session?.user?.id;
    
    // Map profiles to AuthUser objects
    const users: AuthUser[] = profilesData.map(profile => {
      // For the current user, we know the email from the session
      const email = profile.id === currentUserId ? currentUserEmail || '' : '';
      
      return {
        id: profile.id,
        name: profile.name,
        email: email,
        role: profile.role as UserRole, 
        avatar: profile.avatar,
        created_at: profile.created_at // Make sure we grab the creation date
      };
    });
    
    console.log('Processed users with emails:', users);
    
    return users;
  } catch (error) {
    console.error('Error in fetchAllProfiles:', error);
    return [];
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
  
  try {
    // Verificamos si el perfil ya existe antes de crearlo
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return;
    }
    
    // Add retry logic to ensure the profile is created
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            name,
            role,
            created_at: new Date().toISOString() // Explicitly set creation date
          }
        ]);

      if (error) {
        console.error(`Error creating profile (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          toast.error('Error al crear el perfil de usuario: ' + error.message);
          throw error;
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('Profile created successfully for user:', userId);
        success = true;
      }
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error);
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
      // Wait a small amount of time to allow the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));
      await createUserProfile(data.user.id, name, role);
      
      // Verify profile was created and retry if needed
      let profileCreated = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!profileCreated && attempts < maxAttempts) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          profileCreated = true;
          console.log('Verified profile was created:', profileData);
          
          // Additional check: verify the role is correct
          if (profileData.role !== role) {
            console.log(`Profile created with incorrect role: ${profileData.role}, updating to ${role}`);
            await updateUserRoleById(data.user.id, role);
          }
        } else {
          console.log(`Profile not found (attempt ${attempts + 1}), retrying creation...`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          await createUserProfile(data.user.id, name, role);
        }
      }
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
