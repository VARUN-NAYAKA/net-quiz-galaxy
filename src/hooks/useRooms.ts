
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface UserRoom {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  creator?: string;
}

export function useRooms() {
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRooms = async () => {
    try {
      // Get all quiz rooms with creator info
      const { data: allRooms, error } = await supabase
        .from('quiz_rooms')
        .select(`
          id,
          code,
          created_at,
          is_active,
          players!inner(name, is_host)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format rooms with creator info
      const formattedRooms = allRooms.map((room) => {
        const hostPlayer = room.players.find((p: any) => p.is_host);
        return {
          ...room,
          creator: hostPlayer ? hostPlayer.name : "(unknown)"
        };
      });
      
      setUserRooms(formattedRooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomState = async (roomId: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ is_active: newState })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: newState ? "Room Activated" : "Room Suspended",
        description: `Quiz room is now ${newState ? "active" : "suspended"}.`,
      });
      
      // Refresh room list to show updated state
      fetchUserRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      // Delete all players in the room first
      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .eq('room_id', roomId);

      if (playersError) throw playersError;

      // Then delete the room
      const { error: roomError } = await supabase
        .from('quiz_rooms')
        .delete()
        .eq('id', roomId);

      if (roomError) throw roomError;

      toast({
        title: "Room Deleted",
        description: `Quiz room has been permanently deleted.`,
      });
      
      // Refresh room list
      fetchUserRooms();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUserRooms();
    
    // Set up a subscription for real-time updates
    const roomsSubscription = supabase
      .channel('user-rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_rooms' }, fetchUserRooms)
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, []);

  return {
    userRooms,
    loading,
    toggleRoomState,
    deleteRoom,
    fetchUserRooms
  };
}
