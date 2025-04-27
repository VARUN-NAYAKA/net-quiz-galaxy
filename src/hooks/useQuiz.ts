
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function useQuiz(roomCode: string, playerName: string) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoomValidation = useCallback(() => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "Invalid room code. Please join through the lobby.",
        variant: "destructive",
      });
      navigate("/lobby");
    }
  }, [roomCode, navigate, toast]);

  const updateRoomScores = useCallback((score: number) => {
    if (roomCode && playerName) {
      const roomScores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
      const updatedScores = roomScores.map((playerScore: any) =>
        playerScore.name === playerName ? { ...playerScore, score } : playerScore
      );
      sessionStorage.setItem(`scores_${roomCode}`, JSON.stringify(updatedScores));
    }
  }, [roomCode, playerName]);

  const getRoomScores = useCallback(() => {
    return JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
  }, [roomCode]);

  const handleBackToLobby = () => {
    navigate("/lobby");
  };

  return {
    handleRoomValidation,
    updateRoomScores,
    getRoomScores,
    handleBackToLobby,
  };
}
