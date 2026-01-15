import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { MessageCircle, Heart, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches/my-matches`);
      setMatches(response.data);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-purple-600">Loading your matches...</div>
        </div>
      </AppLayout>
    );
  }

  if (matches.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Heart className="w-24 h-24 text-pink-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            No Matches Yet
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Start swiping to find your perfect match!
          </p>
          <Link to="/app/swipe">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
              Start Swiping
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Your Matches
          </h1>
          <p className="text-gray-600 text-lg">
            You have {matches.length} {matches.length === 1 ? 'match' : 'matches'}! 🎉
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.match_id} className="bg-white hover:shadow-xl transition-all border-2 border-pink-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{match.profile.age} years old</CardTitle>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.profile.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {match.profile.interests.slice(0, 3).map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>

                <Link to={`/app/chat/${match.match_id}`}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MatchesPage;
