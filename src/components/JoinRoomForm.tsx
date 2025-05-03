import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';
import { useToast } from "@/components/ui/use-toast";

const JoinRoomForm = () => {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { joinRoom, isLoading } = useSupabaseQuiz();
  const { toast } = useToast();

  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both a nickname and a room code.",
        variant: "destructive",
      });
      return;
    }

    await joinRoom(nickname, roomCode);
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
      </div>
      <div>
        <Label htmlFor="roomCode">Room Code</Label>
        <Input
          id="roomCode"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
      </div>
      <Button onClick={handleJoinRoom} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
        {isLoading ? "Joining..." : "Join Room"}
      </Button>
    </div>
  );
};

export default JoinRoomForm;

