import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, X, Zap, MapPin, Info } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const SwipePage = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches/potential?limit=20`);
      setMatches(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Please create your profile first!');
      } else {
        toast.error('Failed to load matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch) return;

    try {
      const response = await axios.post(`${API}/matches/swipe`, {
        target_user_id: currentMatch.profile.user_id,
        action
      });

      if (response.data.matched) {
        toast.success("🎉 It's a match! You can now chat!");
      } else if (action === 'like') {
        toast.success('❤️ Like sent!');
      }

      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      toast.error('Failed to record swipe');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-purple-600">Loading matches...</div>
        </div>
      </AppLayout>
    );
  }

  if (matches.length === 0 || currentIndex >= matches.length) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Zap className="w-24 h-24 text-purple-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            No More Matches Right Now
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Come back later for more potential matches!
          </p>
          <Link to="/app/matches">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              View Your Matches
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const currentMatch = matches[currentIndex];
  const profile = currentMatch.profile;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto h-full flex flex-col justify-center p-4">
        <Card className="relative bg-white shadow-2xl border-2 border-pink-300 overflow-hidden">
          {/* Profile Image Placeholder */}
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
            <div className="text-8xl">👤</div>
          </div>

          {/* Profile Info */}
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">{profile.age}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location.neighborhood}, {profile.location.city}</span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2">
                {currentMatch.match_score}
              </Badge>
            </div>

            <p className="text-gray-700 mb-4">{profile.bio}</p>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-600">Interests:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="border-purple-300 text-purple-700">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              📍 {currentMatch.distance_km} km away
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="p-6 pt-0 flex justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSwipe('pass')}
              className="rounded-full w-16 h-16 border-2 border-red-300 hover:bg-red-50"
              data-testid="pass-btn"
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSwipe('super_like')}
              className="rounded-full w-16 h-16 border-2 border-blue-300 hover:bg-blue-50"
              data-testid="super-like-btn"
            >
              <Zap className="w-8 h-8 text-blue-500" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleSwipe('like')}
              className="rounded-full w-16 h-16 border-2 border-pink-300 hover:bg-pink-50"
              data-testid="like-btn"
            >
              <Heart className="w-8 h-8 text-pink-500" />
            </Button>
          </div>
        </Card>

        <div className="mt-4 text-center text-gray-600">
          {currentIndex + 1} / {matches.length}
        </div>
      </div>
    </AppLayout>
  );
};

export default SwipePage;
