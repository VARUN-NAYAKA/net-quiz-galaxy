
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  onVerify: () => void;
  verifying: boolean;
  selectedRoom?: { code: string } | null;
}

const PasswordDialog = ({
  open,
  onOpenChange,
  password,
  setPassword,
  onVerify,
  verifying,
  selectedRoom
}: PasswordDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white">
        <DialogHeader>
          <DialogTitle>Verify Room Password</DialogTitle>
          <DialogDescription className="text-white/70">
            Enter the password for room {selectedRoom?.code} to manage it
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="room-password" className="text-white">Room Password</Label>
          <Input 
            id="room-password" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter room password"
            className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password.trim()) {
                onVerify();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/30 bg-white/10 hover:bg-white/30 text-white">
            Cancel
          </Button>
          <Button 
            onClick={onVerify} 
            disabled={verifying || !password.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {verifying ? "Verifying..." : "Verify & Manage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
