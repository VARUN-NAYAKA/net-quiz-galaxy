
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRoomManagement() {
  const [isLoading, setIsLoading] = useState(false);

  // Verify room password
  const verifyRoomPassword = async (roomCode: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('code', roomCode)
        .single();
      
      if (error) throw error;
      
      // Check if room exists and password matches
      if (!data) {
        console.error("Room not found");
        return false;
      }
      
      return data.password === password;
    } catch (error) {
      console.error("Error verifying room password:", error);
      return false;
    }
  };

  // Get all available rooms
  const getAvailableRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select(`
          *,
          players!inner(name, is_host)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format rooms with creator info
      const formattedRooms = data.map((room) => {
        const hostPlayer = room.players.find((p: any) => p.is_host);
        return {
          id: room.id,
          roomCode: room.code,
          creator: hostPlayer ? hostPlayer.name : "(unknown)"
        };
      });
      
      setIsLoading(false);
      return formattedRooms;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setIsLoading(false);
      return [];
    }
  };

  return {
    verifyRoomPassword,
    getAvailableRooms,
    isLoading
  };
}
