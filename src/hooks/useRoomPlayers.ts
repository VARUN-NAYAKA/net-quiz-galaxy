
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Player {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
}

export function useRoomPlayers(roomCode: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      try {
        // First get the room ID from the room code
        const { data: roomData, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('id')
          .eq('code', roomCode)
          .single();

        if (roomError) throw roomError;

        // Then get all players in this room
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomData.id)
          .order('score', { ascending: false });

        if (playersError) throw playersError;

        setPlayers(playersData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching players:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Subscribe to player changes in this room
    const roomSubscription = supabase
      .channel('room_players_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomCode}`
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
    };
  }, [roomCode]);

  return { players, loading, error };
}
