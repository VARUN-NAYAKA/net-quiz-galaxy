
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';
import { supabase } from '@/integrations/supabase/client';

const CreateRoomForm = () => {
  const [nickname, setNickname] = useState('');
  const [quizType, setQuizType] = useState('networking');
  const [password, setPassword] = useState('');
  const { createRoom, isLoading } = useSupabaseQuiz();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // Set a default nickname
        setNickname(session.user.id.slice(0, 8) || 'Host');
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setNickname(session.user.id.slice(0, 8) || 'Host');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Handle authentication
      const userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      
      try {
        // Sign up with the generated user ID and a default password
        const defaultPassword = Math.random().toString(36).substring(2, 10);
        const { error } = await supabase.auth.signUp({
          email: `${userId}@networkquiz.com`,
          password: defaultPassword
        });
        
        if (error) throw error;
        
        // Sign in immediately
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${userId}@networkquiz.com`,
          password: defaultPassword
        });
        
        if (signInError) throw signInError;
        
        // Continue with room creation after a short delay to ensure auth state is updated
        setTimeout(() => {
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
        }, 500);
        
      } catch (error: any) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive"
        });
      }
      return;
    }
    
    // Already authenticated
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
      
      {isAuthenticated && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-white/30 bg-white/10 hover:bg-white/30 text-white"
          onClick={async () => {
            await supabase.auth.signOut();
            toast({
              title: "Signed Out",
              description: "You've been signed out successfully."
            });
          }}
        >
          Sign Out
        </Button>
      )}
    </form>
  );
};

export default CreateRoomForm;
