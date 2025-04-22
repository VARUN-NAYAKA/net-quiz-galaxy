import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizQuestion from "@/components/QuizQuestion";
import AnimatedTimer from "@/components/AnimatedTimer";
import { useToast } from "@/components/ui/use-toast";
import ScoreBoard from "@/components/ScoreBoard";
import QuizHeader from "@/components/QuizHeader";
import QuizCompletion from "@/components/QuizCompletion";
import useQuizState from "@/hooks/useQuizState";
import useQuizTimer from "@/hooks/useQuizTimer";

const QUESTION_TIME = 20;
const INCORRECT_ANSWER_DELAY = 10;

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const roomCode = searchParams.get("room") || "";
  const isHost = searchParams.get("host") === "true" || sessionStorage.getItem("isHost") === "true";

  // Use extracted state management hook
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

  const playerName = sessionStorage.getItem("playerName") || "Player";
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Session/player/room setup code
  useEffect(() => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "Invalid room code. Please join through the lobby.",
        variant: "destructive",
      });
      navigate("/lobby");
    }

    const roomScores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
    if (!roomScores.some((score: any) => score.name === playerName)) {
      roomScores.push({ name: playerName, score: 0 });
      sessionStorage.setItem(`scores_${roomCode}`, JSON.stringify(roomScores));
    }
  }, [roomCode, navigate, toast, playerName]);

  useEffect(() => {
    if (roomCode && playerName) {
      const roomScores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
      const updatedScores = roomScores.map((playerScore: any) =>
        playerScore.name === playerName ? { ...playerScore, score } : playerScore
      );
      sessionStorage.setItem(`scores_${roomCode}`, JSON.stringify(updatedScores));
    }
  }, [score, roomCode, playerName]);

  const getRoomScores = useCallback(() => {
    return JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
  }, [roomCode]);

  // Reset timer for each question/quiz state
  useEffect(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (!quizEnded) setTimeLeft(QUESTION_TIME);
  }, [currentQuestionIndex, quizEnded, autoAdvanceTimer, quizEnded]);

  // Timer/auto-advance logic
  useQuizTimer({
    showAnswer,
    quizEnded,
    answers,
    currentQuestionIndex,
    INCORRECT_ANSWER_DELAY,
    QUESTION_TIME,
    timeLeft,
    setTimeLeft,
    setShowAnswer,
    autoAdvanceTimer,
    handleNextQuestion: useCallback(() => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowAnswer(false);
        setTimeLeft(QUESTION_TIME);
      } else {
        setQuizEnded(true);
      }
    }, [
      autoAdvanceTimer,
      currentQuestionIndex,
      totalQuestions,
      setCurrentQuestionIndex,
      setShowAnswer,
      setQuizEnded,
      setTimeLeft,
    ]),
  });

  const handleAnswer = (selectedIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedIndex;
    setAnswers(newAnswers);

    if (selectedIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
      toast({
        title: "Correct!",
        description: "You got it right!",
        variant: "default",
      });
      setShowAnswer(true);
    } else {
      toast({
        title: "Incorrect",
        description: "That's not the right answer.",
        variant: "destructive",
      });
      setShowAnswer(true);
      setTimeLeft(INCORRECT_ANSWER_DELAY);
    }
  };

  const handleBackToLobby = () => {
    navigate("/lobby");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl">
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
            <Card className="w-full max-w-2xl quiz-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                <AnimatedTimer timeLeft={timeLeft} totalTime={QUESTION_TIME} />
              </CardHeader>
              <CardContent className="space-y-2">
                <QuizQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  timeLeft={undefined}
                  showAnswer={showAnswer}
                  questionIndex={currentQuestionIndex}
                />
              </CardContent>
            </Card>

            {showAnswer && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    if (currentQuestionIndex < totalQuestions - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setShowAnswer(false);
                      setTimeLeft(QUESTION_TIME);
                      if (autoAdvanceTimer.current) {
                        clearTimeout(autoAdvanceTimer.current);
                        autoAdvanceTimer.current = null;
                      }
                    } else {
                      setQuizEnded(true);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  {currentQuestionIndex < totalQuestions - 1
                    ? "Next Question"
                    : "See Results"}
                </Button>
              </div>
            )}

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
