
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trophy, Medal, Award } from "lucide-react";

interface PlayerScore {
  name: string;
  score: number;
}

interface ScoreBoardProps {
  scores: PlayerScore[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores }) => {
  // Sort scores in descending order
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  const renderMedal = (rank: number) => {
    if (rank === 1) {
      return (
        <Trophy className="w-4 h-4 text-yellow-300" aria-label="Gold medal" />
      );
    } else if (rank === 2) {
      return (
        <Medal className="w-4 h-4 text-gray-300" aria-label="Silver medal" />
      );
    } else if (rank === 3) {
      return (
        <Award className="w-4 h-4 text-amber-600" aria-label="Bronze medal" />
      );
    }
    return null;
  };

  return (
    <Card className="w-full bg-white/10 backdrop-blur border-white/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-300" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border-white/20">
          <TableHeader>
            <TableRow className="border-white/20">
              <TableHead className="text-white/80">Rank</TableHead>
              <TableHead className="text-white/80">Player</TableHead>
              <TableHead className="text-white/80 text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedScores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-white/60">No scores yet</TableCell>
              </TableRow>
            ) : (
              sortedScores.map((player, index) => (
                <TableRow key={player.name} className="border-white/20 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <TableCell className="flex items-center gap-1 text-white">
                    {index + 1}
                    {renderMedal(index + 1)}
                  </TableCell>
                  <TableCell className="text-white">{player.name}</TableCell>
                  <TableCell className="text-right text-white">{player.score}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScoreBoard;
