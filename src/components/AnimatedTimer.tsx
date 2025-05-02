
import React from "react";
import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnimatedTimerProps {
  timeLeft: number;
  totalTime: number;
}

const AnimatedTimer: React.FC<AnimatedTimerProps> = ({ timeLeft, totalTime }) => {
  // Calculate percentage of time left
  const timePercentage = (timeLeft / totalTime) * 100;
  
  // Determine color based on time left
  const getTimerColor = () => {
    if (timePercentage > 60) return "text-green-400";
    if (timePercentage > 30) return "text-yellow-400";
    return "text-red-400";
  };
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 font-bold text-lg ${getTimerColor()}`}>
          <Timer className="w-5 h-5" />
          <span className="text-2xl">{timeLeft}s</span>
        </div>
      </div>
      
      <Progress 
        value={timePercentage} 
        className="h-2 bg-gray-700"
        style={{
          "--tw-bg-opacity": "0.3",
        }}
      />
    </div>
  );
};

export default AnimatedTimer;
