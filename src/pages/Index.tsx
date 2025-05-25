
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Coins, GraduationCap, BookOpen, Star } from "lucide-react";
import LearnerDashboard from "@/components/LearnerDashboard";
import TutorDashboard from "@/components/TutorDashboard";

type UserRole = 'learner' | 'tutor' | null;

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate authentication
    localStorage.setItem('user', JSON.stringify({ 
      email, 
      silverCoins: 25, 
      goldCoins: 2, 
      badges: 0,
      completedTopics: 3 
    }));
    setIsAuthenticated(true);
    toast({
      title: isSignUp ? "Welcome to LearnCoin!" : "Welcome back!",
      description: "You have successfully logged in.",
    });
  };

  const selectRole = (role: UserRole) => {
    setUserRole(role);
    toast({
      title: `Role Selected`,
      description: `You are now a ${role}!`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Coins className="w-12 h-12 text-yellow-500 coin-spin mr-2" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                LearnCoin
              </h1>
            </div>
            <p className="text-gray-600">Gamified Peer-to-Peer Learning Platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? "Sign Up" : "Login"}</CardTitle>
              <CardDescription>
                {isSignUp ? "Create your account to start earning coins!" : "Welcome back! Ready to learn and earn?"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {isSignUp ? "Sign Up" : "Login"}
                </Button>
              </form>
              
              <div className="text-center mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-gray-600">How would you like to participate in LearnCoin?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => selectRole('learner')}
            >
              <CardHeader className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <CardTitle className="text-xl">Learner</CardTitle>
                <CardDescription>Request topics and earn silver coins through quizzes</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Coins className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Earn +5 silver coins per quiz</span>
                </div>
                <Button className="w-full">Start Learning</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => selectRole('tutor')}
            >
              <CardHeader className="text-center">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <CardTitle className="text-xl">Tutor</CardTitle>
                <CardDescription>Teach topics and earn gold coins when students pass</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Coins className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Earn +5 gold coins per successful session</span>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-xs text-gray-500">Requires badge to teach</span>
                </div>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Start Teaching</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'learner' ? <LearnerDashboard /> : <TutorDashboard />}
    </div>
  );
};

export default Index;
