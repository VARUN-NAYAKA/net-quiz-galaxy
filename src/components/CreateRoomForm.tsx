
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRoomCreation } from '@/hooks/useRoomCreation';

const CreateRoomForm = () => {
  const [nickname, setNickname] = useState('');
  const [quizType, setQuizType] = useState('networking');
  const [password, setPassword] = useState('');
  const { createRoom, isLoading } = useRoomCreation();
  const { toast } = useToast();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter a nickname to create a game.",
        variant: "destructive"
      });
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a password for the quiz room.",
        variant: "destructive"
      });
      return;
    }

    createRoom(nickname, quizType, password);
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-4 animate-fade-in">
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
      
      <div>
        <Label htmlFor="quizType" className="text-white">Quiz Type</Label>
        <Select 
          value={quizType} 
          onValueChange={setQuizType}
        >
          <SelectTrigger id="quizType" className="mt-1 bg-white/20 border-white/30 text-white">
            <SelectValue placeholder="Select quiz type" />
          </SelectTrigger>
          <SelectContent className="bg-indigo-900 text-white border-white/20">
            <SelectItem value="networking" className="focus:bg-indigo-700">Networking Fundamentals</SelectItem>
            <SelectItem value="security" className="focus:bg-indigo-700">Network Security</SelectItem>
            <SelectItem value="protocols" className="focus:bg-indigo-700">Network Protocols</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="password" className="text-white">Room Password</Label>
        <Input 
          id="password"
          type="password"
          placeholder="Enter room password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
        />
        <p className="text-xs text-white/60 mt-1">This password will be required to manage the room</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Quiz Room"}
      </Button>
    </form>
  );
};

export default CreateRoomForm;
