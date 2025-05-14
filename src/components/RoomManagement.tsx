
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRoom } from "@/hooks/useRooms";
import { useRoomManagement } from "@/hooks/useRoomManagement";
import RoomCard from './RoomCard';
import PasswordDialog from './PasswordDialog';
import RoomDetailsDialog from './RoomDetailsDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface RoomManagementProps {
  userRooms: UserRoom[];
  onToggleRoomState: (roomId: string, currentState: boolean) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  last_active: string;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ 
  userRooms, 
  onToggleRoomState,
  onDeleteRoom
}) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<UserRoom | null>(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { verifyRoomPassword } = useRoomManagement();

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
  
  const handleToggleRoomState = async () => {
    if (!selectedRoom) return;
    await onToggleRoomState(selectedRoom.id, selectedRoom.is_active);
    // Update the selected room state locally for UI
    setSelectedRoom({...selectedRoom, is_active: !selectedRoom.is_active});
  };
  
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    await onDeleteRoom(selectedRoom.id);
    setShowRoomDetails(false);
    setShowDeleteConfirm(false);
  };

  const isPlayerActive = (lastActive: string) => {
    const lastActiveTime = new Date(lastActive).getTime();
    const currentTime = new Date().getTime();
    // Consider active if last active within the past 2 minutes
    return currentTime - lastActiveTime < 2 * 60 * 1000;
  };

  return (
    <div className="space-y-2">
      {userRooms.map(room => (
        <RoomCard 
          key={room.id} 
          room={room} 
          onManageClick={handleRoomAction}
        />
      ))}
      
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
        onToggleRoomState={handleToggleRoomState}
        onRequestDelete={() => setShowDeleteConfirm(true)}
        isPlayerActive={isPlayerActive}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteRoom}
      />
    </div>
  );
};

export default RoomManagement;
