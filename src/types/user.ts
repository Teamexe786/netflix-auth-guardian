export interface User {
  id: string;
  email: string;
  password: string;
  status: 'Live' | 'Off';
  expireTime: string; // ISO date string
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: User | null;
}