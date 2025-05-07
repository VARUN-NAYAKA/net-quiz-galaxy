
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreBoard from "@/components/ScoreBoard";
import ManageRooms from "@/components/ManageRooms";
import { Settings } from "lucide-react";

interface LobbyContentTabsProps {
  isMobile: boolean;
  topScores: {name: string, score: number}[];
}

const LobbyContentTabs: React.FC<LobbyContentTabsProps> = ({ isMobile, topScores }) => {
  return (
    <div className="animate-scale-in transition-all duration-500">
      {isMobile ? (
        <Tabs defaultValue="scores">
          <TabsList className="w-full grid grid-cols-2 bg-white/20 text-white">
            <TabsTrigger value="scores" className="data-[state=active]:bg-white/30 data-[state=active]:text-white">
              Top Scores
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-white/30 data-[state=active]:text-white flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Manage
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="mt-3">
            <ScoreBoard scores={topScores} />
          </TabsContent>
          <TabsContent value="manage" className="mt-3">
            <ManageRooms />
          </TabsContent>
        </Tabs>
      ) : (
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
      )}
    </div>
  );
};

export default LobbyContentTabs;
