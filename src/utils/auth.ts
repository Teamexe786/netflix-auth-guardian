import { User } from '@/types/user';

const USERS_KEY = 'netflix_users';
const AUTH_KEY = 'netflix_auth';

// Default admin user
const defaultAdmin: User = {
  id: 'admin',
  email: 'admin@netflix.com',
  password: 'admin123',
  status: 'Live',
  expireTime: '2030-12-31T23:59:59.000Z'
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    // Initialize with default admin
    const initialUsers = [defaultAdmin];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(users);
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (userData: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString()
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const authenticateUser = (email: string, password: string): { success: boolean; message: string; user?: User; isAdmin?: boolean } => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Wrong Credentials!' };
  }
  
  if (user.status === 'Off') {
    return { success: false, message: 'Account Expired!' };
  }
  
  const now = new Date();
  const expireTime = new Date(user.expireTime);
  
  if (expireTime <= now) {
    return { success: false, message: 'Account Expired!' };
  }
  
  const isAdmin = user.email === 'admin@netflix.com';
  
  // Save auth state
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    isAuthenticated: true,
    isAdmin,
    currentUser: user
  }));
  
  return { success: true, message: 'Login successful!', user, isAdmin };
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getAuthState = () => {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) {
    return { isAuthenticated: false, isAdmin: false, currentUser: null };
  }
  return JSON.parse(auth);
};