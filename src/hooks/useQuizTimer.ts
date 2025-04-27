
import { useEffect, useRef } from "react";

interface UseQuizTimerProps {
  showAnswer: boolean;
  quizEnded: boolean;
  answers: number[];
  currentQuestionIndex: number;
  QUESTION_TIME: number;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setShowAnswer: React.Dispatch<React.SetStateAction<boolean>>;
  autoAdvanceTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  handleNextQuestion: () => void;
  isCorrectAnswer: boolean;
}

export default function useQuizTimer({
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
}: UseQuizTimerProps) {
  useEffect(() => {
    if (quizEnded) return;

    // When showing answer
    if (showAnswer && isCorrectAnswer) {
      // Automatically advance after a brief delay for correct answers
      autoAdvanceTimer.current = setTimeout(() => {
        handleNextQuestion();
      }, 1500);

      return () => {
        if (autoAdvanceTimer.current) {
          clearTimeout(autoAdvanceTimer.current);
        }
      };
    }
    
    // Normal question countdown
    if (!showAnswer && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [
    showAnswer,
    timeLeft,
    quizEnded,
    isCorrectAnswer,
    setShowAnswer,
    setTimeLeft,
    autoAdvanceTimer,
    handleNextQuestion,
  ]);
}
