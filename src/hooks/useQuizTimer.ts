
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

    if (!showAnswer) {
      // Countdown for answering
      if (timeLeft > 0) {
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
      } else {
        setShowAnswer(true);
      }
    } else if (answers[currentQuestionIndex] === undefined && timeLeft === INCORRECT_ANSWER_DELAY) {
      // Start auto-advance timer for incorrect or timeout
      autoAdvanceTimer.current = setTimeout(() => {
        handleNextQuestion();
      }, INCORRECT_ANSWER_DELAY * 1000);
      
      // Start countdown display
      delayIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(delayIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (autoAdvanceTimer.current) {
          clearTimeout(autoAdvanceTimer.current);
        }
        if (delayIntervalRef.current) {
          clearInterval(delayIntervalRef.current);
        }
      };
    }
  }, [
    showAnswer,
    timeLeft,
    quizEnded,
    answers,
    currentQuestionIndex,
    INCORRECT_ANSWER_DELAY,
    setShowAnswer,
    setTimeLeft,
    autoAdvanceTimer,
    handleNextQuestion,
  ]);
}
