import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Heart, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 💕');
      navigate('/app');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </CardTitle>
          <CardDescription>Login to find your perfect match</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                data-testid="login-email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                data-testid="login-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-12 text-lg font-bold"
              data-testid="login-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-pink-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <Link to="/" className="text-sm text-purple-600 hover:underline">
            Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
