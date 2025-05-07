
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PlayerNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedRoom: string;
  onJoinRoom: () => void;
}

const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({
  open,
  onOpenChange,
  playerName,
  setPlayerName,
  selectedRoom,
  onJoinRoom
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white">
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
          <DialogDescription className="text-white/70">
            Please provide a nickname to join room {selectedRoom}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="name" className="text-white">Your Nickname</Label>
          <Input 
            id="name" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your nickname"
            className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/50"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/30 bg-white/10 hover:bg-white/30 text-white">
            Cancel
          </Button>
          <Button onClick={onJoinRoom} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerNameDialog;
