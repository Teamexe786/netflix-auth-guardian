import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NetflixInput } from '@/components/NetflixInput';
import { authenticateUser } from '@/utils/supabase-auth';
import { useToast } from '@/hooks/use-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('netflix-remember-me');
    if (savedCredentials) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticateUser(email, password);
      
      if (result.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('netflix-remember-me', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('netflix-remember-me');
        }

        toast({
          title: "Success!",
          description: result.message,
        });
        
        if (result.isAdmin) {
          navigate('/admin');
        } else {
          // Redirect to Netflix external URL
          window.location.href = 'https://netfree2.cc/mobile/home';
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Netflix Logo */}
      <nav className="fixed top-0 left-0 z-10 p-6 md:p-15">
        <img 
          src="https://codingstella.com/wp-content/uploads/2024/01/580b57fcd9996e24bc43c529.png" 
          alt="Netflix" 
          className="w-32 md:w-42"
        />
      </nav>

      {/* Login Form */}
      <div className="glass-card p-16 w-full max-w-md mx-auto">
        <h2 className="text-foreground text-3xl font-medium mb-6">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="mb-16">
          <NetflixInput
            type="text"
            label="Email or phone number"
            value={email}
            onChange={setEmail}
            required
          />
          
          <NetflixInput
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="netflix-button mt-6 mb-3 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 accent-netflix-light-gray"
              />
              <label htmlFor="remember-me" className="text-netflix-light-gray">
                Remember me
              </label>
            </div>
            <a href="#" className="text-netflix-light-gray hover:underline">
              Need help?
            </a>
          </div>
        </form>
        
        <div className="space-y-4">
          <p className="text-netflix-light-gray">
            Admin?{' '}
            <button 
              onClick={() => navigate('/admin')}
              className="text-foreground hover:underline bg-none border-none cursor-pointer"
            >
              Access Admin Panel
            </button>
          </p>
          
          <small className="block text-netflix-light-gray text-xs leading-relaxed">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <a href="#" className="text-blue-400 hover:underline">
              Learn more.
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};