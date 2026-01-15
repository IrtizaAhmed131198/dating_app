import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Plus, X } from 'lucide-react';

const CreateProfile = () => {
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [neighborhood, setNeighborhood] = useState('Downtown');
  const [lookingFor, setLookingFor] = useState('relationship');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (interests.length === 0) {
      toast.error('Add at least one interest!');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/profile/create`, {
        bio,
        age: parseInt(age),
        interests,
        looking_for: lookingFor,
        neighborhood
      });

      toast.success('Profile created! Let\'s find your matches 💕');
      navigate('/app/swipe');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-2xl">
          <CardHeader className="text-center">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              Tell us about yourself to find your perfect match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="age" className="text-base font-semibold">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="mt-2 h-12 border-2 border-pink-200 focus:border-pink-400"
                  data-testid="profile-age"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-base font-semibold">
                  Bio * (Tell us about yourself)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="I love hiking, coffee shops, and exploring NYC. Looking for someone who enjoys adventure and good conversation..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  rows={4}
                  className="mt-2 border-2 border-pink-200 focus:border-pink-400"
                  data-testid="profile-bio"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">
                  Interests * (Add at least 3)
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="hiking, coffee, travel..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="border-2 border-purple-200 focus:border-purple-400"
                    data-testid="interest-input"
                  />
                  <Button
                    type="button"
                    onClick={addInterest}
                    variant="outline"
                    className="border-2 border-purple-300"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 text-sm"
                    >
                      {interest}
                      <X
                        className="w-4 h-4 ml-2 cursor-pointer hover:text-red-200"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
                {interests.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Add some interests to help find matches!</p>
                )}
              </div>

              <div>
                <Label htmlFor="neighborhood" className="text-base font-semibold">
                  Neighborhood *
                </Label>
                <Input
                  id="neighborhood"
                  placeholder="Downtown, Midtown, etc."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                  className="mt-2 h-12 border-2 border-blue-200 focus:border-blue-400"
                  data-testid="profile-neighborhood"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Looking for...
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {['relationship', 'dating', 'friends'].map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={lookingFor === option ? 'default' : 'outline'}
                      onClick={() => setLookingFor(option)}
                      className={lookingFor === option ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-14 text-lg font-bold"
                data-testid="create-profile-btn"
              >
                {loading ? 'Creating Profile...' : 'Create Profile ✨'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProfile;
