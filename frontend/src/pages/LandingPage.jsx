import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import {
  Heart,
  Sparkles,
  Zap,
  Users,
  Crown,
  Share2,
  Mail,
  CheckCircle2,
  Copy,
  TrendingUp,
  LogIn,
  ArrowRight,
} from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/waitlist/join`, {
        email,
        gender: gender || null,
        referred_by: referralCode || null,
      });

      setUserStats(response.data);
      setShowDashboard(true);
      toast.success(
        gender === "female"
          ? "🎉 Welcome VIP! You're in the fast lane!"
          : "✨ You're on the list! Share your code to move up!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Something went wrong. Try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${userStats.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("🎉 Referral link copied! Share it to earn boosts!");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(userStats.referral_code);
    toast.success("✨ Code copied!");
  };

  if (showDashboard && userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <Toaster position="top-center" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-4">
                <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  You're In! 🎉
                </span>
              </div>
              {userStats.is_vip && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-lg px-4 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  VIP Access - Ladies First!
                </Badge>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-pink-200 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-600">
                    <TrendingUp className="w-5 h-5" />
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    #{userStats.position_in_line}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {userStats.is_vip ? "In the VIP lane!" : "in line"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Zap className="w-5 h-5" />
                    Boosts Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {userStats.boosts}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Each referral = 1 boost
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Users className="w-5 h-5" />
                    Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {userStats.verified_referrals}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    verified invites
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Section */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Share2 className="w-6 h-6 text-pink-600" />
                  Share & Earn Boosts! 🚀
                </CardTitle>
                <CardDescription className="text-base">
                  Every friend who joins with your code moves you up the list!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Your Referral Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={userStats.referral_code}
                      readOnly
                      className="text-2xl font-mono font-bold text-center bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300"
                    />
                    <Button
                      onClick={copyReferralCode}
                      variant="outline"
                      size="icon"
                      className="border-2 border-pink-300 hover:bg-pink-100"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Share Your Link
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}?ref=${userStats.referral_code}`}
                      readOnly
                      className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300"
                    />
                    <Button
                      onClick={copyReferralLink}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg border-2 border-pink-200">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    How It Works:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Share your unique link with friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Each signup = 1 boost earned</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>More boosts = Higher priority access!</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Email Confirmation */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                <Mail className="w-4 h-4 inline mr-2" />
                Check your email: <strong>{userStats.email}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                We'll notify you when it's time to join! 💌
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b-2 border-pink-200 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-600 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              DateApp
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-2 border-pink-300 hover:bg-pink-50" data-testid="nav-login-btn">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white" data-testid="nav-signup-btn">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Playful Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6 animate-bounce-slow">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">
                The Future of Dating is Here
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Real Vibes.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Real Connections.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
              AI-powered pose verification meets authentic dating 💕
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No catfishing, no fake profiles. Just real people ready to connect.
            </p>
          </div>

          {/* VIP Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 p-1 rounded-2xl shadow-xl animate-pulse-slow">
              <div className="bg-white rounded-xl px-8 py-6 text-center">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Ladies First! 👑
                </h3>
                <p className="text-gray-600 mt-2">
                  Women get VIP access + instant boosts
                </p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">
                <Heart className="w-8 h-8 inline text-pink-500 mr-2 animate-pulse" />
                Join The Waitlist
              </CardTitle>
              <CardDescription className="text-base">
                Be among the first to experience the future of dating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinWaitlist} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 h-12 text-base border-2 border-pink-200 focus:border-pink-400"
                    data-testid="email-input"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    I am... (Optional - But ladies get VIP! 👑)
                  </Label>
                  <Tabs value={gender} onValueChange={setGender} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-12">
                      <TabsTrigger value="female" className="text-base" data-testid="gender-female">
                        👩 Woman
                      </TabsTrigger>
                      <TabsTrigger value="male" className="text-base" data-testid="gender-male">
                        👨 Man
                      </TabsTrigger>
                      <TabsTrigger value="other" className="text-base" data-testid="gender-other">
                        ✨ Other
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="referral" className="text-base font-semibold">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="referral"
                    type="text"
                    placeholder="Enter friend's code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="mt-2 h-12 text-base border-2 border-purple-200 focus:border-purple-400 font-mono"
                    data-testid="referral-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Have a friend's code? You'll both get boosts! 🚀
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
                  data-testid="join-waitlist-btn"
                >
                  {loading ? (
                    "Joining..."
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-2" />
                      Join The Waitlist
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-gray-500">
                By joining, you'll be first to know when we launch in NYC! 🗽
              </p>
            </CardFooter>
          </Card>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-pink-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Verified Profiles</h3>
              <p className="text-gray-600">
                Pose detection ensures everyone is who they say they are
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Downtown NYC</h3>
              <p className="text-gray-600">
                Starting local - find matches in your neighborhood
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Invite friends, earn boosts, jump the line!
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
