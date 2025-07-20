import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToUsers, getUsers, addUser } from '@/utils/supabase-auth';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, TestTube, Zap } from 'lucide-react';

export const RealtimeDemo = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load initial users
    const loadUsers = async () => {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
        setIsConnected(true);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();

    // Set up realtime subscription
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setUpdateCount(prev => prev + 1);
      toast({
        title: "⚡ Real-time Update Detected!",
        description: `Database updated. Total users: ${updatedUsers.length}`,
      });
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [toast]);

  const addTestUser = async () => {
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'test123',
        status: 'Live' as const,
        expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      await addUser(testUser);
      toast({
        title: "Test User Added",
        description: "Watch how it appears instantly across all devices!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add test user.",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="glass-card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Realtime Database Demo</h1>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-semibold text-foreground">Connection Status</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected to real-time database' : 'Disconnected'}
            </p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-foreground">Updates Received</span>
            </div>
            <p className="text-2xl font-bold text-primary">{updateCount}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-primary">{users.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={addTestUser}
            className="netflix-button flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Add Test User (Realtime Test)
          </button>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-400 mb-2">🧪 How to Test Real-time Functionality:</h3>
          <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
            <li>Open this page in multiple browser tabs or different devices</li>
            <li>Click "Add Test User" on one tab/device</li>
            <li>Watch the user count and table update instantly on all other tabs/devices</li>
            <li>Go to the Admin panel and add/edit/delete users - changes appear here immediately</li>
            <li>All changes are synchronized across all connected clients in real-time</li>
          </ol>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-4">Recent Users (Real-time)</h3>
          <div className="space-y-2">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                <span className="text-foreground">{user.email}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.status === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};