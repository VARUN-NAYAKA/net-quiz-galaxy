
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Network, Users, Brain } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <div className="text-center text-white max-w-3xl px-4">
        <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
          Network<span className="text-yellow-300">Quiz</span>
        </h1>
        
        <p className="text-xl mb-8">
          Test your networking knowledge in this multiplayer quiz game. 
          Create rooms, invite friends, and see who knows their TCP from their UDP!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="flex items-center p-6">
              <Users className="h-6 w-6 mr-3 text-yellow-300" />
              <div className="text-left">
                <h3 className="font-semibold">Multiplayer</h3>
                <p className="text-sm opacity-80">Play with friends in real-time</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="flex items-center p-6">
              <Trophy className="h-6 w-6 mr-3 text-yellow-300" />
              <div className="text-left">
                <h3 className="font-semibold">Leaderboards</h3>
                <p className="text-sm opacity-80">Compete for the top score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="flex items-center p-6">
              <Network className="h-6 w-6 mr-3 text-yellow-300" />
              <div className="text-left">
                <h3 className="font-semibold">Networking Focus</h3>
                <p className="text-sm opacity-80">Learn about protocols and standards</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="flex items-center p-6">
              <Brain className="h-6 w-6 mr-3 text-yellow-300" />
              <div className="text-left">
                <h3 className="font-semibold">Knowledge Test</h3>
                <p className="text-sm opacity-80">Challenge your networking skills</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/lobby')}
            size="lg"
            className="text-lg bg-white text-indigo-700 hover:bg-white/90 shadow-lg px-8 py-6"
          >
            Start Quiz
          </Button>
          
          <Button
            onClick={() => navigate('/leaderboard')}
            size="lg"
            variant="outline"
            className="text-lg border-white text-white hover:bg-white/20 px-8 py-6"
          >
            View Leaderboard
          </Button>
        </div>
      </div>
      
      <div className="mt-16 text-center text-white/60 text-sm">
        Challenge your networking knowledge with friends or learn solo!
      </div>
    </div>
  );
};

export default Index;
