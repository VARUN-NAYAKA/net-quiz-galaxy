
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CreateRoomForm = () => {
  const [nickname, setNickname] = useState('');
  const [quizType, setQuizType] = useState('networking');
  const { createRoom, isLoading } = useSupabaseQuiz();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
      setShowAuthDialog(true);
      return;
    }
    
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
  
  const handleAuth = async () => {
    if (!password) {
      toast({
        title: "Missing password",
        description: "Please enter a password.",
        variant: "destructive"
      });
      return;
    }
    
    setAuthLoading(true);
    
    try {
      // Generate a random user ID for anonymous authentication
      const userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      
      // Sign up with the generated user ID and provided password
      const { error, data } = await supabase.auth.signUp({
        email: `${userId}@networkquiz.com`,
        password
      });
      
      if (error) throw error;
      
      // Try to sign in immediately since we don't need email verification for this simplified flow
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${userId}@networkquiz.com`,
        password
      });
      
      if (signInError) throw signInError;
      
      toast({
        title: "Authentication successful",
        description: "You can now create quiz rooms.",
      });
      
      setShowAuthDialog(false);
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
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
        
        <Button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : isAuthenticated ? "Create Quiz Room" : "Sign In & Create Quiz"}
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
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white">
          <DialogHeader>
            <DialogTitle>Create Host Account</DialogTitle>
            <DialogDescription className="text-white/70">
              Set a password to create and manage quiz rooms
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              onClick={handleAuth} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={authLoading}
            >
              {authLoading ? "Processing..." : "Create Host Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateRoomForm;
