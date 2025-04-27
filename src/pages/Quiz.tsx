import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizQuestion from "@/components/QuizQuestion";
import AnimatedTimer from "@/components/AnimatedTimer";
import { useToast } from "@/components/ui/use-toast";
import ScoreBoard from "@/components/ScoreBoard";
import QuizHeader from "@/components/QuizHeader";
import QuizCompletion from "@/components/QuizCompletion";
import QuizAnswerHandler from "@/components/QuizAnswerHandler";
import useQuizState from "@/hooks/useQuizState";
import useQuizTimer from "@/hooks/useQuizTimer";
import { useQuiz } from "@/hooks/useQuiz";
import { useIsMobile } from "@/hooks/use-mobile";

const QUESTION_TIME = 20;

const Quiz = () => {
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchParams = new URLSearchParams(location.search);
  const roomCode = searchParams.get("room") || "";
  const isHost = searchParams.get("host") === "true" || sessionStorage.getItem("isHost") === "true";
  const playerName = sessionStorage.getItem("playerName") || "Player";

  const {
    questions,
    currentQuestionIndex,
    score,
    showAnswer,
    quizEnded,
    answers,
    setShowAnswer,
    setCurrentQuestionIndex,
    setScore,
    setQuizEnded,
    setAnswers,
    handleRestartQuiz,
    autoAdvanceTimer,
  } = useQuizState();

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const { handleRoomValidation, updateRoomScores, getRoomScores, handleBackToLobby } = useQuiz(roomCode, playerName);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    handleRoomValidation();
  }, [handleRoomValidation]);

  useEffect(() => {
    updateRoomScores(score);
  }, [score, updateRoomScores]);

  useEffect(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (!quizEnded) setTimeLeft(QUESTION_TIME);
  }, [currentQuestionIndex, quizEnded, autoAdvanceTimer]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setTimeLeft(QUESTION_TIME);
      setIsCorrectAnswer(false);
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
    } else {
      setQuizEnded(true);
    }
  };

  useQuizTimer({
    showAnswer,
    quizEnded,
    answers,
    currentQuestionIndex,
    QUESTION_TIME,
    timeLeft,
    setTimeLeft,
    setShowAnswer,
    autoAdvanceTimer,
    handleNextQuestion,
    isCorrectAnswer,
  });

  const handleAnswer = (selectedIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedIndex;
    setAnswers(newAnswers);

    const correct = selectedIndex === currentQuestion.correctAnswer;
    setIsCorrectAnswer(correct);

    if (correct) {
      setScore(score + 1);
      toast({
        title: "Correct!",
        description: "You got it right!",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "That's not the right answer.",
        variant: "destructive",
      });
    }
    setShowAnswer(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-3xl'}`}>
        <QuizHeader
          roomCode={roomCode}
          playerName={playerName}
          isHost={!!isHost}
          score={score}
          totalQuestions={totalQuestions}
          currentQuestionIndex={currentQuestionIndex}
        />

        {!quizEnded ? (
          <div className="space-y-4">
            <Card className={`w-full ${isMobile ? 'quiz-card p-2' : 'max-w-2xl quiz-card'}`}>
              <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? 'p-3' : ''}`}>
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{currentQuestion.question}</CardTitle>
                <AnimatedTimer timeLeft={timeLeft} totalTime={QUESTION_TIME} />
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

            <ScoreBoard scores={getRoomScores()} />
          </div>
        ) : (
          <QuizCompletion
            score={score}
            totalQuestions={totalQuestions}
            onRestart={handleRestartQuiz}
            onBackToLobby={handleBackToLobby}
          />
        )}

        <Button
          variant="link"
          onClick={handleBackToLobby}
          className="mt-4"
        >
          Leave Quiz
        </Button>
      </div>
    </div>
  );
};

export default Quiz;
