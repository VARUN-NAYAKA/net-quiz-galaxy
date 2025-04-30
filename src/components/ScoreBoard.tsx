
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
        <Trophy className="w-4 h-4 text-yellow-500" aria-label="Gold medal" />
      );
    } else if (rank === 2) {
      return (
        <Medal className="w-4 h-4 text-gray-400" aria-label="Silver medal" />
      );
    } else if (rank === 3) {
      return (
        <Award className="w-4 h-4 text-amber-700" aria-label="Bronze medal" />
      );
    }
    return null;
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedScores.map((player, index) => (
              <TableRow key={player.name}>
                <TableCell className="flex items-center gap-1">
                  {index + 1}
                  {renderMedal(index + 1)}
                </TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScoreBoard;
