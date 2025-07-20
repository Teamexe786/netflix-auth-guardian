import { useState, useEffect } from 'react';
import { subscribeToUsers, getUsers } from '@/utils/supabase-auth';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

export const RealtimeTest = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
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
      toast({
        title: "🔄 Realtime Update",
        description: `User data updated! Total users: ${updatedUsers.length}`,
      });
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [toast]);

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <h3 className="text-lg font-semibold text-foreground">
          Realtime Connection {isConnected ? 'Active' : 'Inactive'}
        </h3>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        This component demonstrates real-time database updates. Any changes made to users will instantly reflect here across all devices.
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-foreground">
          <strong>Total Users:</strong> {users.length}
        </div>
        <div className="text-foreground">
          <strong>Live Users:</strong> {users.filter(u => u.status === 'Live').length}
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Try adding, editing, or deleting users from another device or browser tab - changes will appear here instantly!
      </div>
    </div>
  );
};