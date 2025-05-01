
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';

const CreateRoomForm = () => {
  const [nickname, setNickname] = useState('');
  const [quizType, setQuizType] = useState('networking');
  const { createRoom, isLoading } = useSupabaseQuiz();
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

    createRoom(nickname, quizType);
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-4">
      <div>
        <Label htmlFor="nickname">Your Nickname</Label>
        <Input 
          id="nickname"
          placeholder="Enter your nickname" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="quizType">Quiz Type</Label>
        <Select 
          value={quizType} 
          onValueChange={setQuizType}
        >
          <SelectTrigger id="quizType" className="mt-1">
            <SelectValue placeholder="Select quiz type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="networking">Networking Fundamentals</SelectItem>
            <SelectItem value="security">Network Security</SelectItem>
            <SelectItem value="protocols">Network Protocols</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Quiz Room"}
      </Button>
    </form>
  );
};

export default CreateRoomForm;
