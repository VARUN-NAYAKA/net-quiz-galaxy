
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

interface RoomInfo {
  roomCode: string;
  creator: string;
}

interface AvailableRoomsListProps {
  availableRooms: RoomInfo[];
  loading: boolean;
  onRoomClick: (roomCode: string) => void;
}

const AvailableRoomsList: React.FC<AvailableRoomsListProps> = ({ 
  availableRooms, 
  loading, 
  onRoomClick 
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 text-white animate-scale-in transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-indigo-300" />
          Available Rooms
        </CardTitle>
        <CardDescription className="text-white/80">
          Quick join an existing game room
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-white/70">Loading available rooms...</p>
        ) : availableRooms.length === 0 ? (
          <p className="text-center text-white/70">No active rooms found</p>
        ) : (
          <div className="space-y-2">
            {availableRooms.map(room => (
              <Card key={room.roomCode} className="p-3 hover:bg-white/20 cursor-pointer transition-all duration-200 bg-white/5 text-white border-white/20" 
                onClick={() => onRoomClick(room.roomCode)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{room.roomCode}</p>
                    <p className="text-sm text-white/70">Host: {room.creator}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/30 text-white">Join</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableRoomsList;
