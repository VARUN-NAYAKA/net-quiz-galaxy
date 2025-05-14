
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useRealTimeQuiz(roomCode: string, playerName: string) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateRoom = useCallback(async () => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "Invalid room code. Please join through the lobby.",
        variant: "destructive",
      });
      navigate("/lobby");
      return false;
    }

    try {
      // Check if room exists and is active
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('code', roomCode)
        .eq('is_active', true)
        .single();

      if (roomError) {
        toast({
          title: "Room not found",
          description: "The room does not exist or is no longer active",
          variant: "destructive",
        });
        navigate("/lobby");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating room:", error);
      return false;
    }
  }, [roomCode, navigate, toast]);

  const updatePlayerScore = useCallback(async (score: number) => {
    if (!roomCode || !playerName) return;

    try {
      // First get room ID
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('id')
        .eq('code', roomCode)
        .single();

      if (roomError) throw roomError;

      // Then update player score
      const { error: updateError } = await supabase
        .from('players')
        .update({ score, last_active: new Date().toISOString() })
        .match({ room_id: room.id, name: playerName });

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating score:", error);
    }
  }, [roomCode, playerName]);

  const leaveRoom = useCallback(async () => {
    navigate("/lobby");
  }, [navigate]);

  const endQuiz = useCallback(async () => {
    if (!roomCode) return;
    
    const isHost = sessionStorage.getItem("isHost") === "true";
    if (!isHost) return;

    try {
      // Set room to inactive
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ is_active: false })
        .eq('code', roomCode);

      if (error) throw error;
    } catch (error) {
      console.error("Error ending quiz:", error);
    }
  }, [roomCode]);

  return {
    validateRoom,
    updatePlayerScore,
    leaveRoom,
    endQuiz,
  };
}
