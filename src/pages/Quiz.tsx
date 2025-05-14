
import React from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import QuizHeader from "@/components/QuizHeader";
import QuizCompletion from "@/components/QuizCompletion";
import QuizContent from "@/components/QuizContent";
import QuizControls from "@/components/QuizControls";
import useQuizTimer from "@/hooks/useQuizTimer";
import { useQuizPage } from "@/hooks/useQuizPage";

const Quiz = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const searchParams = new URLSearchParams(location.search);
  const roomCode = searchParams.get("room") || "";
  const isHost = searchParams.get("host") === "true" || sessionStorage.getItem("isHost") === "true";
  const playerName = sessionStorage.getItem("playerName") || "Player";

  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    score,
    showAnswer,
    quizEnded,
    timeLeft,
    setTimeLeft,
    isCorrectAnswer,
    handleAnswer,
    handleNextQuestion,
    handleBackToLobby,
    handleRestartQuizWithBroadcast,
    handleEndQuiz,
    autoAdvanceTimer
  } = useQuizPage(roomCode, isHost, playerName);

  useQuizTimer({
    showAnswer,
    quizEnded,
    answers: [],
    currentQuestionIndex,
    QUESTION_TIME: 20,
    timeLeft,
    setTimeLeft,
    setShowAnswer: () => {}, // This is handled in useQuizPage
    autoAdvanceTimer,
    handleNextQuestion,
    isCorrectAnswer,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-3xl'} animate-fade-in`}>
        <QuizHeader
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          score={score}
          totalQuestions={totalQuestions}
          currentQuestionIndex={currentQuestionIndex}
        />

        {!quizEnded ? (
          <QuizContent
            currentQuestion={currentQuestion}
            timeLeft={timeLeft}
            showAnswer={showAnswer}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            handleAnswer={handleAnswer}
            handleNextQuestion={handleNextQuestion}
            isMobile={isMobile}
          />
        ) : (
          <QuizCompletion
            score={score}
            totalQuestions={totalQuestions}
            onRestart={handleRestartQuizWithBroadcast}
            onBackToLobby={handleBackToLobby}
          />
        )}

        <QuizControls
          handleBackToLobby={handleBackToLobby}
          handleEndQuiz={handleEndQuiz}
          isHost={isHost}
        />
      </div>
    </div>
  );
};

export default Quiz;
