import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

export interface DatabaseUser {
  id: string;
  email: string;
  password: string;
  status: 'Live' | 'Off';
  expire_time: string;
  created_at?: string;
  updated_at?: string;
}

// Convert database user to app user format
const convertToAppUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  password: dbUser.password,
  status: dbUser.status as 'Live' | 'Off',
  expireTime: dbUser.expire_time
});

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data.map(convertToAppUser);
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      password: userData.password,
      status: userData.status,
      expire_time: userData.expireTime
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }

  return convertToAppUser(data);
};

export const updateUser = async (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<boolean> => {
  const updateData: any = {};
  
  if (userData.email) updateData.email = userData.email;
  if (userData.password) updateData.password = userData.password;
  if (userData.status) updateData.status = userData.status;
  if (userData.expireTime) updateData.expire_time = userData.expireTime;

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    return false;
  }

  return true;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
};

export const authenticateUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User; isAdmin?: boolean }> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    return { success: false, message: 'Wrong Credentials!' };
  }

  const user = convertToAppUser(data);

  if (user.status === 'Off') {
    return { success: false, message: 'Account Expired!' };
  }

  const now = new Date();
  const expireTime = new Date(user.expireTime);

  if (expireTime <= now) {
    return { success: false, message: 'Account Expired!' };
  }

  const isAdmin = user.email === 'admin@netflix.com';

  // Save auth state in localStorage for compatibility
  localStorage.setItem('netflix_auth', JSON.stringify({
    isAuthenticated: true,
    isAdmin,
    currentUser: user
  }));

  return { success: true, message: 'Login successful!', user, isAdmin };
};

export const logout = (): void => {
  localStorage.removeItem('netflix_auth');
};

export const getAuthState = () => {
  const auth = localStorage.getItem('netflix_auth');
  if (!auth) {
    return { isAuthenticated: false, isAdmin: false, currentUser: null };
  }
  return JSON.parse(auth);
};

// Realtime subscription for users table
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const channel = supabase
    .channel('users-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      async () => {
        // Fetch updated users when any change occurs
        try {
          const users = await getUsers();
          callback(users);
        } catch (error) {
          console.error('Error fetching users after realtime update:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};