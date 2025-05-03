
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';
import RoomCard from './RoomCard';
import PasswordDialog from './PasswordDialog';
import RoomDetailsDialog from './RoomDetailsDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface UserRoom {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  creator?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  last_active: string;
}

const ManageRooms = () => {
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<UserRoom | null>(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { verifyRoomPassword } = useSupabaseQuiz();
  
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

  const handleRoomAction = (room: UserRoom) => {
    setSelectedRoom(room);
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handleVerifyPassword = async () => {
    if (!selectedRoom) return;
    
    setVerifying(true);
    
    try {
      const isValid = await verifyRoomPassword(selectedRoom.code, password);
      
      if (isValid) {
        setShowPasswordDialog(false);
        setPassword('');
        
        // Fetch players for the room and show details
        await fetchRoomPlayers(selectedRoom.id);
        setShowRoomDetails(true);
      } else {
        toast({
          title: "Incorrect Password",
          description: "The password you entered is incorrect.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const fetchRoomPlayers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('last_active', { ascending: false });

      if (error) throw error;
      setRoomPlayers(data);
    } catch (error) {
      console.error("Error fetching room players:", error);
    }
  };

  const toggleRoomState = async () => {
    if (!selectedRoom) return;
    
    try {
      const newState = !selectedRoom.is_active;
      
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ is_active: newState })
        .eq('id', selectedRoom.id);

      if (error) throw error;

      toast({
        title: newState ? "Room Activated" : "Room Deactivated",
        description: `Quiz room ${selectedRoom.code} is now ${newState ? "active" : "inactive"}.`,
      });
      
      // Update the selected room state
      setSelectedRoom({...selectedRoom, is_active: newState});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteRoom = async () => {
    if (!selectedRoom) return;
    
    try {
      // Delete all players in the room first
      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .eq('room_id', selectedRoom.id);

      if (playersError) throw playersError;

      // Then delete the room
      const { error: roomError } = await supabase
        .from('quiz_rooms')
        .delete()
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      toast({
        title: "Room Deleted",
        description: `Quiz room ${selectedRoom.code} has been permanently deleted.`,
      });

      setShowRoomDetails(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isPlayerActive = (lastActive: string) => {
    const lastActiveTime = new Date(lastActive).getTime();
    const currentTime = new Date().getTime();
    // Consider active if last active within the past 2 minutes
    return currentTime - lastActiveTime < 2 * 60 * 1000;
  };

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-center text-white/70">Loading rooms...</p>
        ) : userRooms.length === 0 ? (
          <p className="text-center text-white/70">No rooms found</p>
        ) : (
          <div className="space-y-2">
            {userRooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onManageClick={handleRoomAction}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Password verification dialog */}
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        password={password}
        setPassword={setPassword}
        onVerify={handleVerifyPassword}
        verifying={verifying}
        selectedRoom={selectedRoom}
      />

      {/* Room details dialog */}
      <RoomDetailsDialog
        open={showRoomDetails}
        onOpenChange={setShowRoomDetails}
        selectedRoom={selectedRoom}
        roomPlayers={roomPlayers}
        onToggleRoomState={toggleRoomState}
        onRequestDelete={() => setShowDeleteConfirm(true)}
        isPlayerActive={isPlayerActive}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={deleteRoom}
      />
    </Card>
  );
};

export default ManageRooms;
