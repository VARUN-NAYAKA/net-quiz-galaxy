
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';

const JoinRoomForm = () => {
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const { joinRoom, isLoading } = useSupabaseQuiz();
  const { toast } = useToast();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a valid room code to join.",
        variant: "destructive"
      });
      return;
    }

    if (!nickname.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter a nickname to join the game.",
        variant: "destructive"
      });
      return;
    }

    joinRoom(nickname, roomCode);
  };

  return (
    <form onSubmit={handleJoinRoom} className="space-y-4 animate-fade-in">
      <div>
        <Label htmlFor="roomCode" className="text-white">Room Code</Label>
        <Input 
          id="roomCode"
          placeholder="Enter 6-digit room code" 
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          maxLength={6}
          className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
      </div>
      
      <div>
        <Label htmlFor="nickname" className="text-white">Your Nickname</Label>
        <Input 
          id="nickname"
          placeholder="Enter your nickname" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? "Joining..." : "Join Quiz Room"}
      </Button>
    </form>
  );
};

export default JoinRoomForm;
