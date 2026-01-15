import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TrendingUp, Eye, Heart, Users, Target, Zap } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/analytics/my-stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-purple-600">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Your Analytics
          </h1>
          <p className="text-gray-600 text-lg">Track your dating journey and progress!</p>
        </div>

        {/* 20+ Interaction Goal */}
        <Card className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              20+ Interaction Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {stats.total_interactions} / 20
                </span>
                <Badge className={stats.goal_progress >= 100 ? 'bg-green-500' : 'bg-purple-500'}>
                  {stats.goal_progress.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={stats.goal_progress} className="h-4" />
              <p className="text-sm text-gray-600">
                {stats.goal_progress >= 100 
                  ? '🎉 Goal achieved! Keep going!'
                  : `${20 - stats.total_interactions} more interactions to reach your goal!`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Eye className="w-5 h-5" />
                Profile Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.views}
              </div>
              <p className="text-sm text-gray-600 mt-2">Profiles you've viewed</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-600">
                <Heart className="w-5 h-5" />
                Likes Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {stats.likes_sent}
              </div>
              <p className="text-sm text-gray-600 mt-2">People you've liked</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Zap className="w-5 h-5" />
                Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.matches}
              </div>
              <p className="text-sm text-gray-600 mt-2">Mutual connections</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Eye className="w-5 h-5" />
                Views Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.profile_views}
              </div>
              <p className="text-sm text-gray-600 mt-2">People viewed your profile</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Heart className="w-5 h-5" />
                Likes Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {stats.likes_received}
              </div>
              <p className="text-sm text-gray-600 mt-2">People who liked you</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <TrendingUp className="w-5 h-5" />
                Match Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {stats.match_rate}%
              </div>
              <p className="text-sm text-gray-600 mt-2">Of your likes matched</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
