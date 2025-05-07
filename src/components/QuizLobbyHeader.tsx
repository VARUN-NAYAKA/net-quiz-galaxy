
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizLobbyHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold text-white">NetworkQuiz</h1>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          onClick={() => navigate('/leaderboard')} 
          variant="outline"
          className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20 animate-fade-in flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          View Leaderboard
        </Button>
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20 flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default QuizLobbyHeader;
