
import React from 'react';
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface RoomCardProps {
  room: {
    id: string;
    code: string;
    created_at: string;
    is_active: boolean;
    creator?: string;
  };
  onManageClick: (room: any) => void;
}

const RoomCard = ({ room, onManageClick }: RoomCardProps) => {
  return (
    <Card key={room.id} className="p-3 bg-white/5 text-white border-white/20 animate-fade-in">
      <div className="flex flex-col">
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <p className="font-medium text-lg">{room.code}</p>
            <span className="text-xs px-2 py-0.5 rounded-full" 
              style={{backgroundColor: room.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                      color: room.is_active ? '#4ADE80' : '#F87171'}}>
              {room.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-white/70">
            Creator: <span className="font-medium">{room.creator}</span>
          </p>
          <p className="text-xs text-white/70">
            Created: {format(new Date(room.created_at), 'MMM dd, yyyy HH:mm:ss')}
          </p>
        </div>
        <div className="flex justify-end mt-1">
          <Button 
            size="sm" 
            variant="default" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-1"
            onClick={() => onManageClick(room)}
          >
            <Settings className="w-4 h-4" /> Manage Room
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
