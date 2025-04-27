
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface QuizAnswerHandlerProps {
  showAnswer: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  handleNextQuestion: () => void;
}

const QuizAnswerHandler: React.FC<QuizAnswerHandlerProps> = ({
  showAnswer,
  currentQuestionIndex,
  totalQuestions,
  handleNextQuestion,
}) => {
  if (!showAnswer) return null;

  return (
    <div className="flex justify-center mt-4">
      <Button
        onClick={handleNextQuestion}
        className="bg-primary hover:bg-primary/90"
      >
        {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
      </Button>
    </div>
  );
};

export default QuizAnswerHandler;
