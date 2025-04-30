
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PlayerScore = { name: string; score: number; roomCode: string };

const getAllScores = (): PlayerScore[] => {
  const allRooms = JSON.parse(sessionStorage.getItem("quizRooms") || "[]");
  let scores: PlayerScore[] = [];
  allRooms.forEach((roomCode: string) => {
    const roomScores = JSON.parse(sessionStorage.getItem(`scores_${roomCode}`) || "[]");
    (roomScores || []).forEach((sc: any) =>
      scores.push({
        name: sc.name,
        score: sc.score,
        roomCode,
      })
    );
  });
  return scores;
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const scores = getAllScores();
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const renderMedal = (rank: number) => {
    if (rank === 1) {
      return (
        <Trophy className="w-5 h-5 text-yellow-500" aria-label="Gold medal" />
      );
    } else if (rank === 2) {
      return (
        <Medal className="w-5 h-5 text-gray-400" aria-label="Silver medal" />
      );
    } else if (rank === 3) {
      return (
        <Award className="w-5 h-5 text-amber-700" aria-label="Bronze medal" />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-primary" />
            Leaderboard (Top 20)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topScores.length === 0 ? (
            <div className="text-center text-muted-foreground">No scores yet!</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 pl-2">Rank</th>
                  <th className="py-1">Player</th>
                  <th className="py-1">Score</th>
                  <th className="py-1">Room</th>
                </tr>
              </thead>
              <tbody>
                {topScores.map((p, i) => (
                  <tr key={`${p.name}-${p.roomCode}`}>
                    <td className="py-1 pl-2 flex items-center gap-1">
                      {i + 1}
                      {renderMedal(i + 1)}
                    </td>
                    <td className="py-1">{p.name}</td>
                    <td className="py-1">{p.score}</td>
                    <td className="py-1">{p.roomCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
        <div className="flex justify-center mb-2">
          <Button onClick={() => navigate("/lobby")} className="mt-3">
            Back to Lobby
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
