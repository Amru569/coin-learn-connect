
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coins, GraduationCap, Trophy, Users, Star, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  learnerEmail?: string;
}

const TutorDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet'>('dashboard');
  const [topicRequests, setTopicRequests] = useState<TopicRequest[]>([]);
  const [zoomLinks, setZoomLinks] = useState<{[key: string]: string}>({});
  const [acceptedSessions, setAcceptedSessions] = useState<TopicRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load existing requests
    const savedRequests = localStorage.getItem('topicRequests');
    if (savedRequests) {
      const allRequests: TopicRequest[] = JSON.parse(savedRequests);
      const pendingRequests = allRequests.filter(req => req.status === 'pending');
      const accepted = allRequests.filter(req => req.status === 'accepted' || req.status === 'completed');
      setTopicRequests(pendingRequests);
      setAcceptedSessions(accepted);
    }
  }, []);

  const acceptRequest = (requestId: string) => {
    const zoomLink = zoomLinks[requestId];
    
    if (!zoomLink) {
      toast({
        title: "Error",
        description: "Please enter a Zoom link before accepting",
        variant: "destructive",
      });
      return;
    }

    // Check if user has badge (required to teach)
    if (user && user.badges < 1) {
      toast({
        title: "Badge Required",
        description: "You need at least one badge to start teaching. Complete 10 topics as a learner first!",
        variant: "destructive",
      });
      return;
    }

    const request = topicRequests.find(req => req.id === requestId);
    if (!request) return;

    const acceptedRequest = {
      ...request,
      status: 'accepted' as const,
      tutorName: 'You',
      zoomLink,
      learnerEmail: 'learner@example.com'
    };

    // Update requests
    const updatedPending = topicRequests.filter(req => req.id !== requestId);
    const updatedAccepted = [...acceptedSessions, acceptedRequest];
    
    setTopicRequests(updatedPending);
    setAcceptedSessions(updatedAccepted);

    // Update localStorage
    const allRequests = [...updatedPending, ...updatedAccepted];
    localStorage.setItem('topicRequests', JSON.stringify(allRequests));

    // Clear zoom link input
    const updatedZoomLinks = { ...zoomLinks };
    delete updatedZoomLinks[requestId];
    setZoomLinks(updatedZoomLinks);

    toast({
      title: "Request Accepted!",
      description: `You accepted the "${request.topic}" request. The learner has been notified.`,
    });

    // Simulate learner completing quiz after 10 seconds
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          goldCoins: user.goldCoins + 5,
          completedTopics: user.completedTopics + 1
        };

        // Check for badge upgrade
        if (updatedUser.completedTopics >= 10 && user.completedTopics < 10) {
          updatedUser.badges += 1;
          updatedUser.goldCoins += 5; // Advanced badge bonus
          toast({
            title: "🏆 Advanced Badge Earned!",
            description: "You earned the Advanced Badge! +5 gold coins bonus!",
          });
        }

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Mark session as completed
        const completedRequest = { ...acceptedRequest, status: 'completed' as const };
        const finalAccepted = updatedAccepted.map(req =>
          req.id === requestId ? completedRequest : req
        );
        setAcceptedSessions(finalAccepted);

        const finalAllRequests = [...updatedPending, ...finalAccepted];
        localStorage.setItem('topicRequests', JSON.stringify(finalAllRequests));

        toast({
          title: "Session Completed! 🎉",
          description: `The learner passed the quiz for "${request.topic}". You earned 5 gold coins!`,
        });
      }
    }, 10000);
  };

  const handleZoomLinkChange = (requestId: string, link: string) => {
    setZoomLinks(prev => ({
      ...prev,
      [requestId]: link
    }));
  };

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
  const canTeach = user.badges >= 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
            <p className="text-gray-600">Share your knowledge and earn gold coins!</p>
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

        {/* Teaching Status */}
        {!canTeach && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-800">Badge Required to Teach</p>
                  <p className="text-sm text-orange-600">
                    Complete 10 topics as a learner to earn your first badge and unlock tutoring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">Silver Coins</p>
                  <p className="text-2xl font-bold text-gray-500">{user.silverCoins}</p>
                </div>
                <Coins className="w-8 h-8 text-gray-400" />
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
                  <p className="text-sm text-gray-600">Sessions Taught</p>
                  <p className="text-2xl font-bold text-green-500">{user.completedTopics}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-500" />
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
                Teach {nextBadgeAt - user.completedTopics} more topics to earn your next badge!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Incoming Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Incoming Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending requests at the moment.</p>
                ) : (
                  topicRequests.map(request => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{request.topic}</h4>
                          <p className="text-sm text-gray-600">Requested by learner</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      
                      <div>
                        <Label htmlFor={`zoom-${request.id}`}>Zoom Meeting Link</Label>
                        <Input
                          id={`zoom-${request.id}`}
                          value={zoomLinks[request.id] || ''}
                          onChange={(e) => handleZoomLinkChange(request.id, e.target.value)}
                          placeholder="https://zoom.us/j/your-meeting-id"
                          className="mt-1"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => acceptRequest(request.id)}
                        className="w-full"
                        disabled={!canTeach}
                      >
                        {canTeach ? 'Accept & Start Session' : 'Badge Required'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active & Completed Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {acceptedSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No sessions yet. Accept a request to get started!</p>
                ) : (
                  acceptedSessions.map(session => (
                    <div key={session.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{session.topic}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Learner: {session.learnerEmail}
                      </p>
                      
                      {session.status === 'accepted' && (
                        <div className="space-y-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(session.zoomLink, '_blank')}
                            className="w-full"
                          >
                            Start Zoom Session
                          </Button>
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4" />
                            Waiting for learner to complete quiz...
                          </div>
                        </div>
                      )}
                      
                      {session.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed! +5 gold coins earned</span>
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

export default TutorDashboard;
