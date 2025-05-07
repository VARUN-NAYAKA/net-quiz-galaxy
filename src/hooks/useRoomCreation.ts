
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useRoomCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Generate a random 6-digit room code
  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create a new quiz room
  const createRoom = async (nickname: string, quizType: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Generate a host ID (simple random string) since we're not using email auth
      const hostId = `host_${Math.random().toString(36).substring(2, 15)}`;
      const roomCode = generateRoomCode();
      
      // Insert room into database with password
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .insert({
          code: roomCode,
          quiz_type: quizType,
          host_id: hostId,
          password: password, // Store the room password
        })
        .select()
        .single();

      if (roomError) {
        console.error("Error creating room:", roomError);
        throw roomError;
      }

      console.log("Room created:", roomData);

      // Insert host player into database
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: nickname,
          is_host: true,
        });

      if (playerError) throw playerError;

      // Store player info in sessionStorage for easy access
      sessionStorage.setItem('playerName', nickname);
      sessionStorage.setItem('roomCode', roomCode);
      sessionStorage.setItem('isHost', 'true');

      toast({
        title: "Room created!",
        description: `Your room code is: ${roomCode}`,
      });

      navigate(`/quiz?room=${roomCode}&host=true`);
    } catch (error: any) {
      toast({
        title: "Error creating room",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error creating room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRoom,
    isLoading
  };
}
