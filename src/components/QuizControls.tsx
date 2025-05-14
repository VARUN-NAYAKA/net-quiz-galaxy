
import React from 'react';
import { Button } from "@/components/ui/button";

interface QuizControlsProps {
  handleBackToLobby: () => void;
  handleEndQuiz: () => void;
  isHost: boolean;
}

const QuizControls: React.FC<QuizControlsProps> = ({
  handleBackToLobby,
  handleEndQuiz,
  isHost
}) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={handleBackToLobby}
        className="border-white/30 bg-white/10 hover:bg-white/30 text-white animate-fade-in"
      >
        Leave Quiz
      </Button>
      
      {isHost && (
        <Button
          variant="destructive"
          onClick={handleEndQuiz}
          className="animate-fade-in"
        >
          End Quiz For All
        </Button>
      )}
    </div>
  );
};

export default QuizControls;
