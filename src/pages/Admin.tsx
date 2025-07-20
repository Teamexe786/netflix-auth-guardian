import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NetflixInput } from '@/components/NetflixInput';
import { getUsers, addUser, logout, getAuthState } from '@/utils/auth';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users, LogOut, Plus } from 'lucide-react';

export const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    status: 'Live' as 'Live' | 'Off',
    expireTime: ''
  });
  const [accessCode, setAccessCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin code was already verified in this session
    const adminAccess = sessionStorage.getItem('admin_access_verified');
    if (adminAccess === 'true') {
      setIsCodeVerified(true);
      setUsers(getUsers());
    }
  }, []);

  const verifyAccessCode = () => {
    if (accessCode === '786391') {
      setIsCodeVerified(true);
      sessionStorage.setItem('admin_access_verified', 'true');
      setUsers(getUsers());
      toast({
        title: "Access Granted",
        description: "Welcome to Admin Panel",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid access code",
      });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.expireTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const userData = {
        ...newUser,
        expireTime: new Date(newUser.expireTime).toISOString()
      };
      
      addUser(userData);
      setUsers(getUsers());
      setNewUser({ email: '', password: '', status: 'Live', expireTime: '' });
      setShowAddForm(false);
      
      toast({
        title: "Success!",
        description: "User added successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add user.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('admin_access_verified');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show access code verification screen
  if (!isCodeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-16 w-full max-w-md mx-auto">
          <h2 className="text-foreground text-3xl font-medium mb-6 text-center">Admin Access</h2>
          <div className="mb-6">
            <NetflixInput
              type="password"
              label="Enter 6-digit access code"
              value={accessCode}
              onChange={setAccessCode}
              required
            />
          </div>
          <button 
            onClick={verifyAccessCode}
            className="netflix-button w-full"
          >
            Verify Access
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 px-6 py-4 bg-secondary text-secondary-foreground rounded hover:bg-accent transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Netflix Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Add User Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 netflix-button max-w-xs"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Add New User</h2>
          <form onSubmit={handleAddUser} className="grid md:grid-cols-2 gap-4">
            <NetflixInput
              type="email"
              label="Email"
              value={newUser.email}
              onChange={(value) => setNewUser({ ...newUser, email: value })}
              required
            />
            
            <NetflixInput
              type="password"
              label="Password"
              value={newUser.password}
              onChange={(value) => setNewUser({ ...newUser, password: value })}
              required
            />
            
            <div className="relative">
              <select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'Live' | 'Off' })}
                className="netflix-input appearance-none"
              >
                <option value="Live">Live</option>
                <option value="Off">Off</option>
              </select>
              <label className="netflix-label text-xs -translate-y-[130%]">Status</label>
            </div>
            
            <div className="relative">
              <input
                type="datetime-local"
                value={newUser.expireTime}
                onChange={(e) => setNewUser({ ...newUser, expireTime: e.target.value })}
                className="netflix-input"
                required
              />
              <label className="netflix-label text-xs -translate-y-[130%]">Expire Time</label>
            </div>
            
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="netflix-button flex-1">
                Add User
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-4 bg-secondary text-secondary-foreground rounded hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">All Users ({users.length})</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground">Expires</th>
                <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {formatDate(user.expireTime)}
                  </td>
                  <td className="py-3 px-4">
                    {user.email !== 'admin@netflix.com' && (
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Add your first user above.
          </div>
        )}
      </div>
    </div>
  );
};