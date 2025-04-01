import { useState, useEffect } from "react";
import { Role, AuthUser, UserRole, CustomRole } from "@/contexts/auth/types";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getCustomRoles, upsertCustomRole } from "@/utils/customDbOperations";
import { defaultPermissions, systemRoles, getDefaultRolePermissions } from "@/data/permissionsData";
import { supabase } from "@/integrations/supabase/client";
import { normalizeRoleName } from "@/utils/formatUtils";

export const useRoles = () => {
  const { fetchAllUsers } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRolesAndUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching profiles...");
      let allUsers: AuthUser[] = [];
      
      try {
        // First attempt: Using RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');
        
        if (rpcError) {
          console.error("Error with RPC call:", rpcError);
          throw rpcError;
        }
        
        if (rpcData) {
          const profilesArray = Array.isArray(rpcData) ? rpcData : [rpcData];
          console.log("RPC returned profiles:", profilesArray.length);
          
          allUsers = profilesArray.map((profile: any) => {
            // Normalizar el rol para asegurar que siempre sea en español
            const normalizedRole = normalizeRoleName(profile.role);
            
            return {
              id: profile.id,
              name: profile.name || 'Sin nombre',
              email: '',
              role: normalizedRole as UserRole,
              avatar: profile.avatar,
              created_at: profile.created_at
            };
          });
        }
      } catch (rpcError) {
        console.error("RPC method failed, falling back to direct query:", rpcError);
        
        try {
          // Second attempt: Direct query to profiles table
          const { data: queryData, error: queryError } = await supabase
            .from('profiles')
            .select('id, name, role, avatar, created_at')
            .order('created_at', { ascending: false });
            
          if (queryError) {
            console.error("Error with fallback query:", queryError);
            throw queryError;
          }
          
          if (queryData) {
            console.log("Direct query returned profiles:", queryData.length);
            
            allUsers = queryData.map(profile => {
              // Normalizar el rol para asegurar que siempre sea en español
              const normalizedRole = normalizeRoleName(profile.role);
              
              return {
                id: profile.id,
                name: profile.name || 'Sin nombre',
                email: '',
                role: normalizedRole as UserRole,
                avatar: profile.avatar,
                created_at: profile.created_at
              };
            });
          }
        } catch (queryError) {
          console.error("Direct query also failed, using fetchAllUsers:", queryError);
          // Third attempt: Use fetchAllUsers from AuthContext
          const fetchedUsers = await fetchAllUsers();
          
          // Normalize roles
          allUsers = fetchedUsers.map(user => ({
            ...user,
            role: normalizeRoleName(user.role) as UserRole
          }));
        }
      }
      
      // After getting users, fetch their emails if available
      if (allUsers.length > 0) {
        try {
          console.log("Fetching emails for users...");
          const userIds = allUsers.map(user => user.id);
          
          const { data: emailData, error: emailError } = await supabase.functions.invoke('create-user-with-profile', {
            body: { 
              action: 'get_emails',
              userIds
            }
          });
          
          if (emailError) {
            console.error("Error fetching emails:", emailError);
          } else if (emailData) {
            console.log("Emails fetched:", Object.keys(emailData).length);
            
            allUsers = allUsers.map(user => ({
              ...user,
              email: emailData[user.id] || user.email || ''
            }));
          }
        } catch (emailError) {
          console.error("Error in email fetching process:", emailError);
        }
      }
      
      console.log("Final user count:", allUsers.length);
      
      // Now fetch custom roles
      let customRoles: Role[] = [];
      
      try {
        console.log("Loading custom roles from database...");
        const dbCustomRoles = await getCustomRoles();
        
        if (dbCustomRoles && dbCustomRoles.length > 0) {
          console.log("Custom roles found:", dbCustomRoles.length);
          customRoles = dbCustomRoles.map(role => ({
            name: normalizeRoleName(role.name) as UserRole,
            description: role.description || '',
            permissions: role.permissions || {},
            userCount: 0,
            isCustom: true
          }));
        } else {
          console.log("No custom roles found in database, checking localStorage");
          const storedRoles = localStorage.getItem('customRoles');
          if (storedRoles) {
            console.log("Loading custom roles from localStorage");
            try {
              const parsedRoles = JSON.parse(storedRoles);
              // Normalize roles
              customRoles = parsedRoles.map((role: Role) => ({
                ...role,
                name: normalizeRoleName(role.name.toString()) as UserRole
              }));
            } catch (e) {
              console.error("Error parsing stored roles:", e);
              customRoles = [];
            }
          }
        }
      } catch (error) {
        console.error("Error loading custom roles:", error);
        // Fallback to localStorage
        const storedRoles = localStorage.getItem('customRoles');
        if (storedRoles) {
          console.log("Loading roles from localStorage due to error");
          try {
            const parsedRoles = JSON.parse(storedRoles);
            // Normalize roles
            customRoles = parsedRoles.map((role: Role) => ({
              ...role,
              name: normalizeRoleName(role.name.toString()) as UserRole
            }));
          } catch (e) {
            console.error("Error parsing stored roles:", e);
            customRoles = [];
          }
        }
      }
      
      // Count users per role (using normalized roles)
      const roleCounts: Record<string, number> = {};
      allUsers.forEach(user => {
        if (user.role) {
          const normalizedRole = normalizeRoleName(user.role);
          roleCounts[normalizedRole] = (roleCounts[normalizedRole] || 0) + 1;
        }
      });
      
      console.log("User counts by role:", roleCounts);
      
      // Create system roles array (ensuring proper role normalization)
      const systemRolesArray: Role[] = Object.entries(systemRoles).map(
        ([roleName, label]) => {
          const normalizedRoleName = normalizeRoleName(roleName) as UserRole;
          
          return {
            name: normalizedRoleName,
            description: label,
            permissions: defaultPermissions.reduce((acc, permission) => {
              // Find the default permission for this role, handling both Spanish and English role names
              const defaultValue = permission.default[normalizedRoleName] || 
                                   permission.default[roleName as UserRole] ||
                                   false;
              
              acc[permission.id] = defaultValue;
              return acc;
            }, {} as Record<string, boolean>),
            userCount: roleCounts[normalizedRoleName] || 0,
            isSystem: true
          };
        }
      );
      
      // Update user counts for custom roles
      customRoles = customRoles.map(role => {
        const normalizedRoleName = normalizeRoleName(role.name.toString());
        return {
          ...role,
          name: normalizedRoleName as UserRole,
          userCount: roleCounts[normalizedRoleName] || 0
        };
      });
      
      // Combine system and custom roles
      const combinedRoles = [...systemRolesArray, ...customRoles];
      console.log("Total roles:", combinedRoles.length);
      setRoles(combinedRoles);
    } catch (error: any) {
      console.error("Error loading roles and users data:", error);
      setError(error.message || "No se pudieron cargar los datos de roles y usuarios");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos de roles y usuarios"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermissions = async (updatedRole: Role) => {
    if (updatedRole.isCustom) {
      try {
        const success = await upsertCustomRole({
          name: updatedRole.name,
          description: updatedRole.description,
          permissions: updatedRole.permissions
        });
        
        if (!success) {
          throw new Error("Failed to save custom role");
        }
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Fallback to localStorage
        const updatedCustomRoles = roles
          .filter(role => role.isCustom)
          .map(role => 
            role.name === updatedRole.name ? updatedRole : role
          );
          
        localStorage.setItem('customRoles', JSON.stringify(updatedCustomRoles));
      }
    }
    
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.name === updatedRole.name ? updatedRole : role
      )
    );
    
    toast({
      title: "Permisos actualizados",
      description: `Los permisos para el rol '${updatedRole.name}' se han actualizado correctamente`,
    });
  };
  
  const handleCreateRole = async (name: string, description: string, baseRole: UserRole) => {
    // Validate inputs
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre del rol no puede estar vacío"
      });
      return;
    }
    
    // Normalize role name
    const normalizedName = normalizeRoleName(name);
    const normalizedBaseRole = normalizeRoleName(baseRole) as UserRole;
    
    // Check for name conflicts
    const existingRole = roles.find(role => 
      normalizeRoleName(role.name.toString()).toLowerCase() === normalizedName.toLowerCase()
    );
    
    if (existingRole) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Ya existe un rol con el nombre '${name}'`
      });
      return;
    }
    
    const newRole: Role = {
      name: normalizedName as UserRole,
      description,
      permissions: getDefaultRolePermissions(normalizedBaseRole),
      userCount: 0,
      isCustom: true
    };
    
    try {
      const success = await upsertCustomRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions
      });
      
      if (!success) {
        throw new Error("Failed to save custom role");
      }
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Fallback to localStorage
      const customRoles = roles.filter(role => role.isCustom);
      customRoles.push(newRole);
      localStorage.setItem('customRoles', JSON.stringify(customRoles));
    }
    
    setRoles(prevRoles => [...prevRoles, newRole]);
    
    toast({
      title: "Rol creado",
      description: `El rol '${name}' se ha creado correctamente`
    });
  };
  
  const handleDuplicateRole = (role: Role) => {
    const baseName = role.name.toString();
    const normalizedBaseName = normalizeRoleName(baseName);
    let newName = `${normalizedBaseName}_copia`;
    
    // Ensure the duplicate name is unique
    let counter = 1;
    while (roles.some(r => normalizeRoleName(r.name.toString()) === newName)) {
      counter++;
      newName = `${normalizedBaseName}_copia_${counter}`;
    }
    
    handleCreateRole(
      newName, 
      `Copia de ${role.description || role.name}`,
      normalizedBaseName as UserRole
    );
  };

  useEffect(() => {
    loadRolesAndUsers();
  }, []);

  return {
    roles,
    isLoading,
    error,
    handleSavePermissions,
    handleCreateRole,
    handleDuplicateRole,
    reloadRoles: loadRolesAndUsers
  };
};
