
import { useEffect, useRef } from "react";

interface UseQuizTimerProps {
  showAnswer: boolean;
  quizEnded: boolean;
  answers: number[];
  currentQuestionIndex: number;
  INCORRECT_ANSWER_DELAY: number;
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
  INCORRECT_ANSWER_DELAY,
  QUESTION_TIME,
  timeLeft,
  setTimeLeft,
  setShowAnswer,
  autoAdvanceTimer,
  handleNextQuestion,
  isCorrectAnswer,
}: UseQuizTimerProps) {
  const delayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up interval on component unmount or when changing questions
    return () => {
      if (delayIntervalRef.current) {
        clearInterval(delayIntervalRef.current);
        delayIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (quizEnded) return;

    // When showing answer
    if (showAnswer) {
      if (isCorrectAnswer) {
        // Automatically advance after a brief delay for correct answers
        autoAdvanceTimer.current = setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      } else {
        // Start countdown for incorrect answers
        setTimeLeft(INCORRECT_ANSWER_DELAY);
        delayIntervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(delayIntervalRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        if (autoAdvanceTimer.current) {
          clearTimeout(autoAdvanceTimer.current);
        }
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
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
    INCORRECT_ANSWER_DELAY,
    setShowAnswer,
    setTimeLeft,
    autoAdvanceTimer,
    handleNextQuestion,
  ]);
}
