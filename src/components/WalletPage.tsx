
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Coins, Trophy, CreditCard, Gift, ArrowUpDown } from "lucide-react";

interface User {
  email: string;
  silverCoins: number;
  goldCoins: number;
  badges: number;
  completedTopics: number;
}

interface WalletPageProps {
  user: User | null;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
}

const WalletPage = ({ user, onBack, onUserUpdate }: WalletPageProps) => {
  const [buyAmount, setBuyAmount] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const { toast } = useToast();

  if (!user) return <div>Loading...</div>;

  const handleBuyCoins = () => {
    const amount = parseInt(buyAmount);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = {
      ...user,
      goldCoins: user.goldCoins + amount
    };
    
    onUserUpdate(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setBuyAmount("");
    
    toast({
      title: "Purchase Successful!",
      description: `You bought ${amount} gold coins for $${amount * 1}.`,
    });
  };

  const handleConvertSilver = () => {
    const amount = parseInt(convertAmount);
    if (!amount || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum conversion is 10 silver coins",
        variant: "destructive",
      });
      return;
    }

    if (amount > user.silverCoins) {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough silver coins",
        variant: "destructive",
      });
      return;
    }

    if (amount % 10 !== 0) {
      toast({
        title: "Invalid Amount",
        description: "Silver coins must be converted in multiples of 10",
        variant: "destructive",
      });
      return;
    }

    const goldCoinsToAdd = amount / 10;
    const updatedUser = {
      ...user,
      silverCoins: user.silverCoins - amount,
      goldCoins: user.goldCoins + goldCoinsToAdd
    };
    
    onUserUpdate(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setConvertAmount("");
    
    toast({
      title: "Conversion Successful!",
      description: `Converted ${amount} silver coins to ${goldCoinsToAdd} gold coins.`,
    });
  };

  const handleConvertBadge = () => {
    if (user.badges < 1) {
      toast({
        title: "No Badges Available",
        description: "You need at least 1 badge to convert",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = {
      ...user,
      badges: user.badges - 1,
      silverCoins: user.silverCoins + 25
    };
    
    onUserUpdate(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    toast({
      title: "Badge Converted!",
      description: "Converted 1 badge to 25 silver coins.",
    });
  };

  const handleRedeem = (type: string) => {
    if (user.goldCoins < 10) {
      toast({
        title: "Insufficient Gold Coins",
        description: "You need at least 10 gold coins to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    const updatedUser = {
      ...user,
      goldCoins: user.goldCoins - 10
    };
    
    onUserUpdate(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    toast({
      title: "Reward Redeemed!",
      description: `You redeemed a ${type}! Check your email for details.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 text-gray-400 coin-bounce" />
              <h3 className="text-lg font-medium text-gray-600">Silver Coins</h3>
              <p className="text-3xl font-bold text-gray-500">{user.silverCoins}</p>
              <p className="text-sm text-gray-500 mt-2">Earned through quizzes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Coins className="w-12 h-12 mx-auto mb-4 text-yellow-500 coin-bounce" />
              <h3 className="text-lg font-medium text-gray-600">Gold Coins</h3>
              <p className="text-3xl font-bold text-yellow-500">{user.goldCoins}</p>
              <p className="text-sm text-gray-500 mt-2">Premium currency</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-orange-500 badge-glow" />
              <h3 className="text-lg font-medium text-gray-600">Badges</h3>
              <p className="text-3xl font-bold text-orange-500">{user.badges}</p>
              <p className="text-sm text-gray-500 mt-2">Achievement rewards</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Conversion Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Convert Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Silver to Gold */}
              <div className="space-y-3">
                <h4 className="font-medium">Silver to Gold Coins</h4>
                <p className="text-sm text-gray-600">10 silver coins = 1 gold coin</p>
                <div className="flex gap-2">
                  <Input
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    placeholder="Enter silver coins (min 10)"
                    type="number"
                    min="10"
                    step="10"
                  />
                  <Button onClick={handleConvertSilver}>Convert</Button>
                </div>
              </div>

              {/* Badge to Silver */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Badge to Silver Coins</h4>
                <p className="text-sm text-gray-600">1 badge = 25 silver coins</p>
                <Button 
                  onClick={handleConvertBadge}
                  disabled={user.badges < 1}
                  className="w-full"
                >
                  Convert 1 Badge → 25 Silver Coins
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Buy Gold Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Purchase gold coins with real money</p>
              <p className="text-sm font-medium">Rate: $1 = 1 Gold Coin</p>
              
              <div className="flex gap-2">
                <Input
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="Enter amount"
                  type="number"
                  min="1"
                />
                <Button onClick={handleBuyCoins}>
                  Buy ${buyAmount || "0"}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button variant="outline" onClick={() => setBuyAmount("5")}>
                  $5
                </Button>
                <Button variant="outline" onClick={() => setBuyAmount("10")}>
                  $10
                </Button>
                <Button variant="outline" onClick={() => setBuyAmount("25")}>
                  $25
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Redeem Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">$5 Gift Card</h4>
                  <p className="text-sm text-gray-600 mb-3">Amazon, iTunes, Google Play</p>
                  <p className="font-bold text-yellow-600 mb-3">10 Gold Coins</p>
                  <Button 
                    size="sm" 
                    onClick={() => handleRedeem("$5 Gift Card")}
                    disabled={user.goldCoins < 10}
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">$5 Cashback</h4>
                  <p className="text-sm text-gray-600 mb-3">PayPal transfer</p>
                  <p className="font-bold text-yellow-600 mb-3">10 Gold Coins</p>
                  <Button 
                    size="sm" 
                    onClick={() => handleRedeem("$5 Cashback")}
                    disabled={user.goldCoins < 10}
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <h4 className="font-medium mb-2">Discount Coupon</h4>
                  <p className="text-sm text-gray-600 mb-3">Various stores</p>
                  <p className="font-bold text-yellow-600 mb-3">10 Gold Coins</p>
                  <Button 
                    size="sm" 
                    onClick={() => handleRedeem("Discount Coupon")}
                    disabled={user.goldCoins < 10}
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 Tip: Complete more sessions to earn gold coins and unlock rewards!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
