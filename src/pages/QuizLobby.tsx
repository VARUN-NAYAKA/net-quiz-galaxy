
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import QuizLobbyHeader from "@/components/QuizLobbyHeader";
import GameOptionsCard from "@/components/GameOptionsCard";
import AvailableRoomsList from "@/components/AvailableRoomsList";
import LobbyContentTabs from "@/components/LobbyContentTabs";
import PlayerNameDialog from "@/components/PlayerNameDialog";

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
  const isMobile = useIsMobile();

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
        <QuizLobbyHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Left column - Join/Create Game */}
          <div>
            <GameOptionsCard activeTab={activeTab} onTabChange={(value) => setActiveTab(value)} />
          </div>

          {/* Middle column - Available Rooms */}
          <div>
            <AvailableRoomsList 
              availableRooms={availableRooms}
              loading={loading}
              onRoomClick={handleRoomClick}
            />
          </div>

          {/* Right column - Top Scores */}
          <LobbyContentTabs isMobile={isMobile} topScores={topScores} />
        </div>
        
        {/* Welcome message at the bottom */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-white text-lg font-medium">Welcome to our CN mini project</p>
        </div>
      </div>

      {/* Name Input Dialog */}
      <PlayerNameDialog
        open={showNameDialog}
        onOpenChange={setShowNameDialog}
        playerName={playerName}
        setPlayerName={setPlayerName}
        selectedRoom={selectedRoom}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
};

export default QuizLobby;
