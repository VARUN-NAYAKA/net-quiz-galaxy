
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useRoomJoining() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Join an existing quiz room
  const joinRoom = useCallback(async (nickname: string, roomCode: string) => {
    setIsLoading(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError) {
        throw new Error("Room not found");
      }

      // Check if room is active
      if (!room.is_active) {
        throw new Error("This room is currently suspended and not accepting new players");
      }

      // Check if player with same name already exists in room
      const { data: existingPlayer, error: playerCheckError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .eq('name', nickname)
        .maybeSingle();

      if (existingPlayer) {
        // Update existing player's last_active time
        await supabase
          .from('players')
          .update({ last_active: new Date().toISOString() })
          .eq('id', existingPlayer.id);
      } else {
        // Create new player
        const { error: playerInsertError } = await supabase
          .from('players')
          .insert({
            room_id: room.id,
            name: nickname,
            is_host: false,
          });

        if (playerInsertError) throw playerInsertError;
      }

      // Store player info in sessionStorage for easy access
      sessionStorage.setItem('playerName', nickname);
      sessionStorage.setItem('roomCode', roomCode);
      sessionStorage.setItem('isHost', 'false');

      navigate(`/quiz?room=${roomCode}`);
    } catch (error: any) {
      toast({
        title: "Error joining room",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error joining room:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  return {
    joinRoom,
    isLoading
  };
}
