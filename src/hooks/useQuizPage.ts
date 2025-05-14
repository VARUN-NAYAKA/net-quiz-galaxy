
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import useQuizState from "@/hooks/useQuizState";
import { useRealTimeQuiz } from "@/hooks/useRealTimeQuiz";

export function useQuizPage(roomCode: string, isHost: boolean, playerName: string) {
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

  const [timeLeft, setTimeLeft] = useState(20);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { validateRoom, updatePlayerScore, leaveRoom, endQuiz } = useRealTimeQuiz(roomCode, playerName);

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
    if (!quizEnded) setTimeLeft(20);
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
      setTimeLeft(20);
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

  return {
    questions,
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    score,
    showAnswer,
    quizEnded,
    timeLeft,
    setTimeLeft,
    isCorrectAnswer,
    setIsCorrectAnswer,
    handleAnswer,
    handleNextQuestion,
    handleBackToLobby,
    handleRestartQuizWithBroadcast,
    handleEndQuiz,
    autoAdvanceTimer
  };
}
