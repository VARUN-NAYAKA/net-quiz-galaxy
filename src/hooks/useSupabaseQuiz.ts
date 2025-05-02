
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSupabaseQuiz() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Generate a random 6-digit room code
  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create a new quiz room
  const createRoom = async (nickname: string, quizType: string) => {
    setIsLoading(true);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a room.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const roomCode = generateRoomCode();
      
      // Insert room into database with RLS bypass
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .insert({
          code: roomCode,
          quiz_type: quizType,
          host_id: session.user.id,
        })
        .select()
        .single();

      if (roomError) {
        console.error("Error creating room:", roomError);
        throw roomError;
      }

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

  // Join an existing quiz room
  const joinRoom = async (nickname: string, roomCode: string) => {
    setIsLoading(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('code', roomCode)
        .eq('is_active', true)
        .single();

      if (roomError) {
        throw new Error("Room not found or no longer active");
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
  };

  // Get all available rooms
  const getAvailableRooms = async () => {
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
      return data.map((room) => {
        const hostPlayer = room.players.find((p: any) => p.is_host);
        return {
          id: room.id,
          roomCode: room.code,
          creator: hostPlayer ? hostPlayer.name : "(unknown)"
        };
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };

  return {
    createRoom,
    joinRoom,
    getAvailableRooms,
    isLoading
  };
}
