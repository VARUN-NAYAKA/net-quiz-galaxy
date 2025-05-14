
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizQuestion from "@/components/QuizQuestion";
import AnimatedTimer from "@/components/AnimatedTimer";
import QuizAnswerHandler from "@/components/QuizAnswerHandler";

interface QuizContentProps {
  currentQuestion: any;
  timeLeft: number;
  showAnswer: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  handleAnswer: (selectedIndex: number) => void;
  handleNextQuestion: () => void;
  isMobile: boolean;
}

const QuizContent: React.FC<QuizContentProps> = ({
  currentQuestion,
  timeLeft,
  showAnswer,
  currentQuestionIndex,
  totalQuestions,
  handleAnswer,
  handleNextQuestion,
  isMobile
}) => {
  return (
    <div className="space-y-4">
      <Card className={`w-full ${isMobile ? 'quiz-card p-2' : 'max-w-2xl quiz-card'} bg-white/10 backdrop-blur border-white/20 text-white animate-scale-in`}>
        <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{currentQuestion.question}</CardTitle>
          <AnimatedTimer timeLeft={timeLeft} totalTime={20} />
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-2' : 'space-y-2'}`}>
          <QuizQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            timeLeft={undefined}
            showAnswer={showAnswer}
            questionIndex={currentQuestionIndex}
          />
        </CardContent>
      </Card>

      <QuizAnswerHandler
        showAnswer={showAnswer}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        handleNextQuestion={handleNextQuestion}
      />
    </div>
  );
};

export default QuizContent;
