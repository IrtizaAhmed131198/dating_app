import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, Calendar } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signup(email, password, fullName, gender, dateOfBirth);
    setLoading(false);

    if (result.success) {
      toast.success('Account created! Let\'s create your profile 🎉');
      navigate('/create-profile');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-purple-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Join Us!
          </CardTitle>
          <CardDescription>Start your journey to finding love</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                data-testid="signup-name"
              />
            </div>

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
                data-testid="signup-email"
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
                minLength={6}
                className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                data-testid="signup-password"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                max={new Date(Date.now() - 567648000000).toISOString().split('T')[0]} // 18 years ago
                className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                data-testid="signup-dob"
              />
            </div>

            <div>
              <Label className="mb-3 block">I am...</Label>
              <Tabs value={gender} onValueChange={setGender} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="female" className="text-base" data-testid="signup-gender-female">
                    👩 Woman
                  </TabsTrigger>
                  <TabsTrigger value="male" className="text-base" data-testid="signup-gender-male">
                    👨 Man
                  </TabsTrigger>
                  <TabsTrigger value="other" className="text-base" data-testid="signup-gender-other">
                    ✨ Other
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-12 text-lg font-bold"
              data-testid="signup-btn"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
