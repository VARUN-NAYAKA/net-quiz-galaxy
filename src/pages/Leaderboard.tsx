
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type PlayerScore = { 
  id: string;
  name: string; 
  score: number; 
  roomCode?: string;
  room_id?: string;
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Get all players with their scores
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select(`
            id,
            name,
            score,
            room_id,
            quiz_rooms!inner (
              code
            )
          `)
          .order('score', { ascending: false });
        
        if (playersError) throw playersError;
        
        // Format the data
        const formattedScores: PlayerScore[] = playersData.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score,
          roomCode: player.quiz_rooms.code
        }));
        
        setScores(formattedScores);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Set up real-time listener for player score changes
    const playersChannel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players'
      }, () => {
        fetchLeaderboard();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(playersChannel);
    };
  }, []);

  const topScores = scores.slice(0, 20);

  const renderMedal = (rank: number) => {
    if (rank === 1) {
      return (
        <Trophy className="w-5 h-5 text-yellow-300" aria-label="Gold medal" />
      );
    } else if (rank === 2) {
      return (
        <Medal className="w-5 h-5 text-gray-300" aria-label="Silver medal" />
      );
    } else if (rank === 3) {
      return (
        <Award className="w-5 h-5 text-amber-600" aria-label="Bronze medal" />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <Card className="w-full max-w-lg animate-fade-in bg-white/10 backdrop-blur border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-yellow-300" />
            Leaderboard (Top 20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-white/60">Loading scores...</div>
          ) : topScores.length === 0 ? (
            <div className="text-center text-white/60">No scores yet!</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 pl-2 text-white/80">Rank</th>
                  <th className="py-1 text-white/80">Player</th>
                  <th className="py-1 text-white/80">Score</th>
                  <th className="py-1 text-white/80">Room</th>
                </tr>
              </thead>
              <tbody>
                {topScores.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="py-1 pl-2 flex items-center gap-1 text-white">
                      {i + 1}
                      {renderMedal(i + 1)}
                    </td>
                    <td className="py-1 text-white">{p.name}</td>
                    <td className="py-1 text-white">{p.score}</td>
                    <td className="py-1 text-white">{p.roomCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
        <div className="flex justify-center mb-4">
          <Button 
            onClick={() => navigate("/lobby")} 
            className="mt-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 animate-scale-in"
          >
            Back to Lobby
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
