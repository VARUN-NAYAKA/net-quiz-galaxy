
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinRoomForm from "@/components/JoinRoomForm";
import CreateRoomForm from "@/components/CreateRoomForm";
import { supabase } from "@/integrations/supabase/client";
import ScoreBoard from "@/components/ScoreBoard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const QuizLobby = () => {
  const [activeTab, setActiveTab] = useState("join");
  const [availableRooms, setAvailableRooms] = useState<{roomCode: string, creator: string}[]>([]);
  const [topScores, setTopScores] = useState<{name: string, score: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">NetworkQuiz</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Join/Create Game */}
        <div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Game</CardTitle>
              <CardDescription>
                Join an existing game or create your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="join" onValueChange={(value) => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="join">Join Game</TabsTrigger>
                  <TabsTrigger value="create">Create Game</TabsTrigger>
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
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Available Rooms</CardTitle>
              <CardDescription>
                Quick join an existing game room
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading available rooms...</p>
              ) : availableRooms.length === 0 ? (
                <p className="text-center text-muted-foreground">No active rooms found</p>
              ) : (
                <div className="space-y-2">
                  {availableRooms.map(room => (
                    <Card key={room.roomCode} className="p-3 hover:bg-muted cursor-pointer" 
                      onClick={() => navigate(`/quiz?room=${room.roomCode}`)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{room.roomCode}</p>
                          <p className="text-sm text-muted-foreground">Host: {room.creator}</p>
                        </div>
                        <Button size="sm" variant="outline">Join</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Top Scores */}
        <div>
          <ScoreBoard scores={topScores} />
        </div>
      </div>
    </div>
  );
};

export default QuizLobby;
