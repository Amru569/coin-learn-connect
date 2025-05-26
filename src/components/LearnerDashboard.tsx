import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Coins, BookOpen, Trophy, Clock, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import QuizPage from "./QuizPage";
import WalletPage from "./WalletPage";

interface User {
  email: string;
  silverCoins: number;
  goldCoins: number;
  badges: number;
  completedTopics: number;
}

interface TopicRequest {
  id: string;
  topic: string;
  status: 'pending' | 'accepted' | 'completed';
  tutorName?: string;
  zoomLink?: string;
}

const predefinedTopics = [
  "Linear Algebra",
  "Calculus I",
  "Calculus II",
  "Statistics",
  "Physics I",
  "Chemistry",
  "Programming Basics",
  "Data Structures",
  "Machine Learning",
  "Web Development"
];

const LearnerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quiz' | 'wallet'>('dashboard');
  const [topicRequests, setTopicRequests] = useState<TopicRequest[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [currentQuizTopic, setCurrentQuizTopic] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load existing requests
    const savedRequests = localStorage.getItem('topicRequests');
    if (savedRequests) {
      setTopicRequests(JSON.parse(savedRequests));
    }
  }, []);

  const requestTopic = () => {
    const topic = newTopic === "custom" ? customTopic : newTopic;
    
    if (!topic) {
      toast({
        title: "Error",
        description: "Please select or enter a topic",
        variant: "destructive",
      });
      return;
    }

    const newRequest: TopicRequest = {
      id: Date.now().toString(),
      topic,
      status: 'pending'
    };

    const updatedRequests = [...topicRequests, newRequest];
    setTopicRequests(updatedRequests);
    localStorage.setItem('topicRequests', JSON.stringify(updatedRequests));

    // Simulate tutor acceptance after 3 seconds
    setTimeout(() => {
      const acceptedRequest = {
        ...newRequest,
        status: 'accepted' as const,
        tutorName: 'Dr. Smith',
        zoomLink: 'https://zoom.us/j/1234567890'
      };
      
      const finalRequests = updatedRequests.map(req => 
        req.id === newRequest.id ? acceptedRequest : req
      );
      setTopicRequests(finalRequests);
      localStorage.setItem('topicRequests', JSON.stringify(finalRequests));
      
      toast({
        title: "Request Accepted!",
        description: `Dr. Smith accepted your request for ${topic}. Check your sessions.`,
      });
    }, 3000);

    setNewTopic("");
    setCustomTopic("");
    
    toast({
      title: "Topic Requested",
      description: `Your request for "${topic}" has been submitted!`,
    });
  };

  const startQuiz = (topic: string) => {
    setCurrentQuizTopic(topic);
    setActiveTab('quiz');
  };

  const handleQuizComplete = (passed: boolean, topic: string) => {
    if (passed && user) {
      const updatedUser = {
        ...user,
        silverCoins: user.silverCoins + 5,
        completedTopics: user.completedTopics + 1
      };
      
      // Check for badge upgrade
      if (updatedUser.completedTopics >= 10 && user.completedTopics < 10) {
        updatedUser.badges += 1;
        updatedUser.silverCoins += 25; // Beginner badge bonus
        toast({
          title: "🏆 Badge Earned!",
          description: "You earned the Beginner Badge! +25 silver coins bonus!",
        });
      }
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Mark request as completed
      const updatedRequests = topicRequests.map(req =>
        req.topic === topic ? { ...req, status: 'completed' as const } : req
      );
      setTopicRequests(updatedRequests);
      localStorage.setItem('topicRequests', JSON.stringify(updatedRequests));
    }
    
    setCurrentQuizTopic(null);
    setActiveTab('dashboard');
  };

  if (activeTab === 'quiz' && currentQuizTopic) {
    return (
      <QuizPage 
        topic={currentQuizTopic}
        onComplete={handleQuizComplete}
        onBack={() => {
          setCurrentQuizTopic(null);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  if (activeTab === 'wallet') {
    return (
      <WalletPage 
        user={user}
        onBack={() => setActiveTab('dashboard')}
        onUserUpdate={setUser}
      />
    );
  }

  if (!user) return <div>Loading...</div>;

  const badgeProgress = (user.completedTopics % 10) * 10;
  const nextBadgeAt = Math.ceil(user.completedTopics / 10) * 10;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Learner Dashboard</h1>
            <p className="text-gray-600">Welcome back! Ready to learn something new?</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === 'wallet' ? 'default' : 'outline'}
              onClick={() => setActiveTab('wallet')}
            >
              Wallet
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Silver Coins</p>
                  <p className="text-2xl font-bold text-gray-500">{user.silverCoins}</p>
                </div>
                <Coins className="w-8 h-8 text-gray-400 coin-bounce" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gold Coins</p>
                  <p className="text-2xl font-bold text-yellow-500">{user.goldCoins}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-500 coin-bounce" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Badges</p>
                  <p className="text-2xl font-bold text-orange-500">{user.badges}</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-500 badge-glow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Topics Completed</p>
                  <p className="text-2xl font-bold text-blue-500">{user.completedTopics}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" />
              Badge Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next badge</span>
                <span>{user.completedTopics % 10}/10 topics</span>
              </div>
              <Progress value={badgeProgress} className="h-3" />
              <p className="text-xs text-gray-500">
                Complete {nextBadgeAt - user.completedTopics} more topics to earn your next badge!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Request Topic */}
          <Card>
            <CardHeader>
              <CardTitle>Request a Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Select Topic</Label>
                <Select value={newTopic} onValueChange={setNewTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedTopics.map(topic => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newTopic === "custom" && (
                <div>
                  <Label htmlFor="customTopic">Custom Topic</Label>
                  <Input
                    id="customTopic"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter your custom topic"
                  />
                </div>
              )}
              
              <Button onClick={requestTopic} className="w-full">
                Request Topic
              </Button>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topicRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No sessions yet. Request a topic to get started!</p>
                ) : (
                  topicRequests.map(request => (
                    <div key={request.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{request.topic}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      {request.status === 'accepted' && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Tutor: {request.tutorName}</p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(request.zoomLink, '_blank')}
                            >
                              Join Zoom
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => startQuiz(request.topic)}
                            >
                              Take Quiz
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {request.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed! +5 coins earned</span>
                        </div>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Waiting for tutor...</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
