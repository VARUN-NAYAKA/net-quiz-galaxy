
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import JoinRoomForm from '@/components/JoinRoomForm';
import CreateRoomForm from '@/components/CreateRoomForm';
import ScoreBoard from '@/components/ScoreBoard';

const QuizLobby = () => {
  const [activeTab, setActiveTab] = useState("join");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedRoomCode, setSelectedRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get all room codes
  const allRooms = JSON.parse(sessionStorage.getItem('quizRooms') || '[]');
  
  // Combine scores from all rooms
  const allScores = allRooms.reduce((acc: any[], roomCode: string) => {
    const roomScores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || '[]');
    return [...acc, ...roomScores];
  }, []);

  // Build a list of rooms with creator name (the first entry in scores_{room})
  const availableRooms = allRooms.map((roomCode: string) => {
    const scores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || '[]');
    return {
      roomCode,
      creator: scores.length > 0 ? scores[0].name : "(unknown)"
    };
  });

  const openJoinDialog = (roomCode: string) => {
    setSelectedRoomCode(roomCode);
    setIsJoinDialogOpen(true);
  };

  const handleJoinSelectedRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter a nickname to join the game.",
        variant: "destructive"
      });
      return;
    }

    // Store user info in session storage
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('roomCode', selectedRoomCode);
    
    // Initialize player score in the room's scoreboard
    const roomScores = JSON.parse(sessionStorage.getItem(`scores_${selectedRoomCode}`) || '[]');
    if (!roomScores.some((score: any) => score.name === playerName)) {
      roomScores.push({ name: playerName, score: 0 });
      sessionStorage.setItem(`scores_${selectedRoomCode}`, JSON.stringify(roomScores));
    }
    
    // Navigate to the quiz with the room code as param
    navigate(`/quiz?room=${selectedRoomCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Lobby</CardTitle>
            <CardDescription className="text-center">
              Join an existing quiz room or create your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="join" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="join">Join Quiz</TabsTrigger>
                <TabsTrigger value="create">Create Quiz</TabsTrigger>
              </TabsList>
              
              <TabsContent value="join">
                <JoinRoomForm />
              </TabsContent>
              
              <TabsContent value="create">
                <CreateRoomForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white mt-1"
          onClick={() => { window.location.href = "/leaderboard"; }}
        >
          View Leaderboard
        </Button>

        <ScoreBoard scores={allScores} />

        <Card className="w-full mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Available Rooms</CardTitle>
            <CardDescription>
              Browse open quiz rooms and see who is the creator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <div className="text-center text-muted-foreground py-2">No rooms available yet.</div>
            ) : (
              <ul className="space-y-2">
                {availableRooms.map(room => (
                  <li key={room.roomCode} className="flex justify-between items-center px-3 py-2 rounded bg-muted">
                    <span>
                      <span className="font-semibold text-foreground">{room.roomCode}</span>
                      <span className="mx-2">|</span>
                      <span className="italic">Created by: </span>
                      <span className="font-medium">{room.creator}</span>
                    </span>
                    <Button 
                      onClick={() => openJoinDialog(room.roomCode)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Join Room
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Button 
        variant="link" 
        onClick={() => navigate("/")} 
        className="mt-4 text-white hover:text-white/90"
      >
        Back to Home
      </Button>
      
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Room {selectedRoomCode}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="playerName" className="text-right">
              Your Nickname
            </Label>
            <Input
              id="playerName"
              placeholder="Enter your nickname"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleJoinSelectedRoom}>Join Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizLobby;
