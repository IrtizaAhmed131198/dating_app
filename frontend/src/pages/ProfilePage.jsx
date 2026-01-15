import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { User, MapPin, Heart, LogOut } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile/me`);
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-purple-600">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <User className="w-24 h-24 text-purple-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Profile not found</h2>
          <Button onClick={() => navigate('/create-profile')} className="bg-gradient-to-r from-pink-500 to-purple-600">
            Create Profile
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6">
        <Card className="bg-white shadow-2xl border-2 border-pink-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Your Profile
              </CardTitle>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo Placeholder */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center text-6xl">
                👤
              </div>
            </div>

            {/* Basic Info */}
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">{profile.age} years old</h2>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profile.location.neighborhood}, {profile.location.city}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                About Me
              </h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge
                    key={interest}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 text-sm"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Looking For</h3>
              <Badge variant="outline" className="border-purple-300 text-purple-700 px-4 py-2">
                {profile.looking_for.charAt(0).toUpperCase() + profile.looking_for.slice(1)}
              </Badge>
            </div>

            {/* Verification Status */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Verification</h3>
              <Badge className={profile.is_verified ? 'bg-green-500' : 'bg-gray-400'}>
                {profile.is_verified ? '✓ Verified' : 'Not Verified'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
