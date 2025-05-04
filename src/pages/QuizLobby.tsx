
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinRoomForm from "@/components/JoinRoomForm";
import CreateRoomForm from "@/components/CreateRoomForm";
import { supabase } from "@/integrations/supabase/client";
import ScoreBoard from "@/components/ScoreBoard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Gamepad2, Trophy, Settings } from "lucide-react";
import ManageRooms from "@/components/ManageRooms";

const QuizLobby = () => {
  const [activeTab, setActiveTab] = useState("join");
  const [availableRooms, setAvailableRooms] = useState<{roomCode: string, creator: string}[]>([]);
  const [topScores, setTopScores] = useState<{name: string, score: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch available rooms
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data: rooms, error } = await supabase
          .from('quiz_rooms')
          .select(`
            code,
            host_id,
            is_active,
            players!inner(name, is_host)
          `)
          .eq('is_active', true)
          .limit(10);

        if (error) throw error;

        const formattedRooms = rooms.map(room => {
          const hostPlayer = room.players.find((p: any) => p.is_host);
          return {
            roomCode: room.code,
            creator: hostPlayer ? hostPlayer.name : room.host_id
          };
        });

        setAvailableRooms(formattedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }

      // Fetch top scores
      try {
        const { data: players, error } = await supabase
          .from('players')
          .select('name, score')
          .order('score', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setTopScores(players);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Set up a subscription for real-time updates
    const roomsSubscription = supabase
      .channel('public:quiz_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_rooms' }, fetchRooms)
      .subscribe();

    const playersSubscription = supabase
      .channel('public:players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchRooms)
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
      supabase.removeChannel(playersSubscription);
    };
  }, []);

  const handleRoomClick = (roomCode: string) => {
    setSelectedRoom(roomCode);
    setShowNameDialog(true);
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your nickname to join the game",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('code', selectedRoom)
        .single();

      if (roomError) {
        throw new Error("Room not found");
      }
      
      // Check if room is active
      if (!room.is_active) {
        throw new Error("This room is currently suspended and not accepting new players");
      }

      // Check if player with same name already exists in room
      const { data: existingPlayer, error: playerCheckError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .eq('name', playerName)
        .maybeSingle();

      if (existingPlayer) {
        // Update existing player's last_active time
        await supabase
          .from('players')
          .update({ last_active: new Date().toISOString() })
          .eq('id', existingPlayer.id);
      } else {
        // Create new player
        const { error: playerInsertError } = await supabase
          .from('players')
          .insert({
            room_id: room.id,
            name: playerName,
            is_host: false,
          });

        if (playerInsertError) throw playerInsertError;
      }

      // Store player info in sessionStorage for easy access
      sessionStorage.setItem('playerName', playerName);
      sessionStorage.setItem('roomCode', selectedRoom);
      sessionStorage.setItem('isHost', 'false');

      navigate(`/quiz?room=${selectedRoom}`);
    } catch (error: any) {
      toast({
        title: "Error joining room",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error joining room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">NetworkQuiz</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/leaderboard')} 
              variant="outline"
              className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20 animate-fade-in flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Leaderboard
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20">
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Left column - Join/Create Game */}
          <div>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-indigo-300" />
                  Quiz Game
                </CardTitle>
                <CardDescription className="text-white/80">
                  Join an existing game or create your own
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="join" onValueChange={(value) => setActiveTab(value)}>
                  <TabsList className="grid w-full grid-cols-2 bg-white/20 text-white">
                    <TabsTrigger value="join" className="data-[state=active]:bg-white/30 data-[state=active]:text-white">
                      Join Game
                    </TabsTrigger>
                    <TabsTrigger value="create" className="data-[state=active]:bg-white/30 data-[state=active]:text-white">
                      Create Game
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="join" className="mt-6">
                    <JoinRoomForm />
                  </TabsContent>
                  <TabsContent value="create" className="mt-6">
                    <CreateRoomForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Middle column - Available Rooms */}
          <div>
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white animate-scale-in transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-indigo-300" />
                  Available Rooms
                </CardTitle>
                <CardDescription className="text-white/80">
                  Quick join an existing game room
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-white/70">Loading available rooms...</p>
                ) : availableRooms.length === 0 ? (
                  <p className="text-center text-white/70">No active rooms found</p>
                ) : (
                  <div className="space-y-2">
                    {availableRooms.map(room => (
                      <Card key={room.roomCode} className="p-3 hover:bg-white/20 cursor-pointer transition-all duration-200 bg-white/5 text-white border-white/20" 
                        onClick={() => handleRoomClick(room.roomCode)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{room.roomCode}</p>
                            <p className="text-sm text-white/70">Host: {room.creator}</p>
                          </div>
                          <Button size="sm" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/30 text-white">Join</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Top Scores */}
          <div className="animate-scale-in transition-all duration-500">
            <Tabs defaultValue="scores">
              <TabsList className="w-full grid grid-cols-2 bg-white/20 text-white">
                <TabsTrigger value="scores" className="data-[state=active]:bg-white/30 data-[state=active]:text-white">
                  Top Scores
                </TabsTrigger>
                <TabsTrigger value="manage" className="data-[state=active]:bg-white/30 data-[state=active]:text-white flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Manage Rooms
                </TabsTrigger>
              </TabsList>
              <TabsContent value="scores" className="mt-3">
                <ScoreBoard scores={topScores} />
              </TabsContent>
              <TabsContent value="manage" className="mt-3">
                <ManageRooms />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Welcome message at the bottom */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-white text-lg font-medium">Welcome to our CN mini project</p>
        </div>
      </div>

      {/* Name Input Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
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
            <Button variant="outline" onClick={() => setShowNameDialog(false)} className="border-white/30 bg-white/10 hover:bg-white/30 text-white">
              Cancel
            </Button>
            <Button onClick={handleJoinRoom} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Join Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizLobby;
