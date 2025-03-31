
import { useState, useEffect } from "react";
import { Role, AuthUser, UserRole, CustomRole } from "@/contexts/auth/types";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getCustomRoles, upsertCustomRole } from "@/utils/customDbOperations";
import { defaultPermissions, systemRoles, getDefaultRolePermissions } from "@/data/permissionsData";
import { supabase } from "@/integrations/supabase/client";

export const useRoles = () => {
  const { fetchAllUsers } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRolesAndUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log("Attempting to fetch profiles using RPC...");
      let allUsers: AuthUser[] = [];
      
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');
        
        if (rpcError) {
          console.error("Error with RPC call:", rpcError);
          throw rpcError;
        }
        
        if (rpcData) {
          console.log("RPC returned profiles:", Array.isArray(rpcData) ? rpcData.length : 'not an array');
          
          const profilesArray = Array.isArray(rpcData) ? rpcData : [rpcData];
          
          allUsers = profilesArray.map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Sin nombre',
            email: '',
            role: profile.role as UserRole,
            avatar: profile.avatar,
            created_at: profile.created_at
          }));
        }
      } catch (rpcError) {
        console.error("RPC method failed, falling back to regular query:", rpcError);
        
        try {
          const { data: queryData, error: queryError } = await supabase
            .from('profiles')
            .select('id, name, role, avatar, created_at');
            
          if (queryError) {
            console.error("Error with fallback query:", queryError);
            throw queryError;
          }
          
          if (queryData) {
            console.log("Direct query returned profiles:", queryData.length);
            
            allUsers = queryData.map(profile => ({
              id: profile.id,
              name: profile.name || 'Sin nombre',
              email: '',
              role: profile.role as UserRole,
              avatar: profile.avatar,
              created_at: profile.created_at
            }));
          }
        } catch (queryError) {
          console.error("Direct query also failed:", queryError);
          allUsers = await fetchAllUsers();
        }
      }
      
      try {
        if (allUsers.length > 0) {
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
        }
      } catch (emailError) {
        console.error("Error in email fetching process:", emailError);
      }
      
      console.log("Final user count after all fetching attempts:", allUsers.length);
      
      let customRoles: Role[] = [];
      
      try {
        console.log("Loading custom roles from database...");
        const dbCustomRoles = await getCustomRoles();
        
        if (dbCustomRoles && dbCustomRoles.length > 0) {
          console.log("Custom roles found:", dbCustomRoles.length);
          customRoles = dbCustomRoles.map(role => ({
            name: role.name as UserRole,
            description: role.description,
            permissions: role.permissions,
            userCount: 0,
            isCustom: true
          }));
        } else {
          console.log("No custom roles found in database");
          const storedRoles = localStorage.getItem('customRoles');
          if (storedRoles) {
            console.log("Loading custom roles from localStorage");
            customRoles = JSON.parse(storedRoles);
          }
        }
      } catch (error) {
        console.error("Error loading custom roles:", error);
        const storedRoles = localStorage.getItem('customRoles');
        if (storedRoles) {
          console.log("Loading roles from localStorage due to error");
          customRoles = JSON.parse(storedRoles);
        }
      }
      
      const roleCounts: Record<string, number> = {};
      allUsers.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      
      console.log("User counts by role:", roleCounts);
      
      const systemRolesArray: Role[] = Object.entries(systemRoles).map(
        ([roleName, label]) => ({
          name: roleName as UserRole,
          description: label,
          permissions: defaultPermissions.reduce((acc, permission) => {
            acc[permission.id] = permission.default[roleName as UserRole];
            return acc;
          }, {} as Record<string, boolean>),
          userCount: roleCounts[roleName] || 0,
          isSystem: true
        })
      );
      
      customRoles = customRoles.map(role => ({
        ...role,
        userCount: roleCounts[role.name as string] || 0
      }));
      
      const combinedRoles = [...systemRolesArray, ...customRoles];
      console.log("Combined roles:", combinedRoles);
      setRoles(combinedRoles);
    } catch (error) {
      console.error("Error loading roles and users data:", error);
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
    const newRole: Role = {
      name: name as UserRole,
      description,
      permissions: getDefaultRolePermissions(baseRole),
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
    const newName = `${baseName}_copia`;
    
    handleCreateRole(
      newName, 
      `Copia de ${role.description || role.name}`,
      role.name as UserRole
    );
  };

  useEffect(() => {
    loadRolesAndUsers();
  }, []);

  return {
    roles,
    isLoading,
    handleSavePermissions,
    handleCreateRole,
    handleDuplicateRole,
    reloadRoles: loadRolesAndUsers
  };
};
