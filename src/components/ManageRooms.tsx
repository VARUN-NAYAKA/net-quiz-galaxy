
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useRooms } from '@/hooks/useRooms';
import RoomManagement from './RoomManagement';

const ManageRooms = () => {
  const { userRooms, loading, toggleRoomState, deleteRoom } = useRooms();

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-center text-white/70">Loading rooms...</p>
        ) : userRooms.length === 0 ? (
          <p className="text-center text-white/70">No rooms found</p>
        ) : (
          <RoomManagement 
            userRooms={userRooms} 
            onToggleRoomState={toggleRoomState} 
            onDeleteRoom={deleteRoom} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ManageRooms;
