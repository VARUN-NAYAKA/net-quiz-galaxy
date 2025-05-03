
import React from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Play, Pause } from "lucide-react";
import { Player } from "@/hooks/useRoomPlayers";

interface RoomDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRoom: any;
  roomPlayers: Player[];
  onToggleRoomState: () => void;
  onRequestDelete: () => void;
  isPlayerActive: (lastActive: string) => boolean;
}

const RoomDetailsDialog = ({
  open,
  onOpenChange,
  selectedRoom,
  roomPlayers,
  onToggleRoomState,
  onRequestDelete,
  isPlayerActive
}: RoomDetailsDialogProps) => {
  if (!selectedRoom) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Room Details: {selectedRoom.code}
            <span className="text-xs px-2 py-0.5 rounded-full" 
              style={{backgroundColor: selectedRoom.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                      color: selectedRoom.is_active ? '#4ADE80' : '#F87171'}}>
              {selectedRoom.is_active ? "Active" : "Inactive"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Created: {selectedRoom.created_at && format(new Date(selectedRoom.created_at), 'MMM dd, yyyy HH:mm:ss')} by {selectedRoom.creator}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={onToggleRoomState}
              className={selectedRoom.is_active 
                ? "bg-red-500/80 hover:bg-red-600 text-white"
                : "bg-green-500/80 hover:bg-green-600 text-white"}
            >
              {selectedRoom.is_active ? (
                <><Pause className="w-4 h-4 mr-1" /> Suspend Room</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> Resume Room</>
              )}
            </Button>
            
            <Button 
              onClick={onRequestDelete}
              variant="destructive"
              className="bg-red-600/80 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete Room
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Players ({roomPlayers.length})</h3>
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/10">
                  <TableRow className="hover:bg-white/5">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Score</TableHead>
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white/70">No players found</TableCell>
                    </TableRow>
                  ) : (
                    roomPlayers.map((player) => (
                      <TableRow key={player.id} className="hover:bg-white/5">
                        <TableCell className="font-medium text-white">{player.name}</TableCell>
                        <TableCell className="text-white">{player.score}</TableCell>
                        <TableCell className="text-white">{player.is_host ? "Host" : "Player"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${isPlayerActive(player.last_active) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {isPlayerActive(player.last_active) ? "Online" : "Offline"}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/70 text-xs">{format(new Date(player.last_active), 'MMM dd, HH:mm:ss')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/30 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
