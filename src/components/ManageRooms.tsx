
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface UserRoom {
  id: string;
  code: string;
  created_at: string;
}

const ManageRooms = () => {
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserRooms = async () => {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserRooms([]);
        setLoading(false);
        return;
      }
      
      try {
        // Get rooms where this user is the host
        const { data: hostRooms, error } = await supabase
          .from('quiz_rooms')
          .select(`
            id,
            code,
            created_at
          `)
          .eq('host_id', session.user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUserRooms(hostRooms || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const endRoom = async (roomId: string, roomCode: string) => {
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: "Room Ended",
        description: `Quiz room ${roomCode} has been ended.`,
      });
      
      // The list will update automatically due to the subscription
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
      <CardContent className="pt-6">
        {!supabase.auth.getSession() && (
          <div className="text-center py-4">
            <p className="mb-3 text-white/80">Sign in to manage your quiz rooms</p>
            <Button 
              onClick={() => supabase.auth.signInWithPassword({ email: '', password: '' })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse"
            >
              Sign In
            </Button>
          </div>
        )}
        
        {loading ? (
          <p className="text-center text-white/70">Loading your rooms...</p>
        ) : userRooms.length === 0 ? (
          <p className="text-center text-white/70">No active rooms found</p>
        ) : (
          <div className="space-y-2">
            {userRooms.map(room => (
              <Card key={room.id} className="p-3 bg-white/5 text-white border-white/20 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{room.code}</p>
                    <p className="text-xs text-white/70">
                      Created: {new Date(room.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="bg-red-500/80 hover:bg-red-600 text-white"
                    onClick={() => endRoom(room.id, room.code)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> End Quiz
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageRooms;
