
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuizQuestion from "@/components/QuizQuestion";
import AnimatedTimer from "@/components/AnimatedTimer";
import { useToast } from "@/components/ui/use-toast";
import QuizHeader from "@/components/QuizHeader";
import QuizCompletion from "@/components/QuizCompletion";
import QuizAnswerHandler from "@/components/QuizAnswerHandler";
import useQuizState from "@/hooks/useQuizState";
import useQuizTimer from "@/hooks/useQuizTimer";
import { useRealTimeQuiz } from "@/hooks/useRealTimeQuiz";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRoomPlayers } from "@/hooks/useRoomPlayers";
import { supabase } from "@/integrations/supabase/client";

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

  const { validateRoom, updatePlayerScore, leaveRoom, endQuiz } = useRealTimeQuiz(roomCode, playerName);
  const { players } = useRoomPlayers(roomCode);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    validateRoom();
  }, [validateRoom]);

  useEffect(() => {
    updatePlayerScore(score);
  }, [score, updatePlayerScore]);

  useEffect(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (!quizEnded) setTimeLeft(QUESTION_TIME);
  }, [currentQuestionIndex, quizEnded, autoAdvanceTimer]);

  // Set up channel for synchronizing quiz state across clients
  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase.channel(`quiz_state_${roomCode}`)
      .on('broadcast', { event: 'quiz_update' }, (payload) => {
        const { currentQuestionIndex, showAnswer, quizEnded } = payload.payload;
        
        // Only non-hosts should follow the host's state
        if (!isHost) {
          setCurrentQuestionIndex(currentQuestionIndex);
          setShowAnswer(showAnswer);
          setQuizEnded(quizEnded);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, isHost, setCurrentQuestionIndex, setShowAnswer, setQuizEnded]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setShowAnswer(false);
      setTimeLeft(QUESTION_TIME);
      setIsCorrectAnswer(false);
      
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
      
      // If host, broadcast the state change
      if (isHost) {
        supabase.channel(`quiz_state_${roomCode}`).send({
          type: 'broadcast',
          event: 'quiz_update',
          payload: {
            currentQuestionIndex: nextIndex,
            showAnswer: false,
            quizEnded: false
          }
        });
      }
    } else {
      setQuizEnded(true);
      
      // If host, broadcast quiz ended
      if (isHost) {
        supabase.channel(`quiz_state_${roomCode}`).send({
          type: 'broadcast',
          event: 'quiz_update',
          payload: {
            currentQuestionIndex,
            showAnswer: true,
            quizEnded: true
          }
        });
      }
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
    
    // If host, broadcast the state change
    if (isHost) {
      supabase.channel(`quiz_state_${roomCode}`).send({
        type: 'broadcast',
        event: 'quiz_update',
        payload: {
          currentQuestionIndex,
          showAnswer: true,
          quizEnded: false
        }
      });
    }
  };

  const handleBackToLobby = () => {
    leaveRoom();
  };

  const handleRestartQuizWithBroadcast = () => {
    handleRestartQuiz();
    
    // If host, broadcast the restart
    if (isHost) {
      supabase.channel(`quiz_state_${roomCode}`).send({
        type: 'broadcast',
        event: 'quiz_update',
        payload: {
          currentQuestionIndex: 0,
          showAnswer: false,
          quizEnded: false
        }
      });
    }
  };

  const handleEndQuiz = () => {
    endQuiz();
    handleBackToLobby();
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
          </div>
        ) : (
          <QuizCompletion
            score={score}
            totalQuestions={totalQuestions}
            onRestart={handleRestartQuizWithBroadcast}
            onBackToLobby={handleBackToLobby}
          />
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Live Scoreboard</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Player</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className={player.name === playerName ? "font-bold" : ""}>
                    <td>{player.name} {player.is_host ? "(Host)" : ""}</td>
                    <td className="text-right">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handleBackToLobby}
          >
            Leave Quiz
          </Button>
          
          {isHost && (
            <Button
              variant="destructive"
              onClick={handleEndQuiz}
            >
              End Quiz For All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
