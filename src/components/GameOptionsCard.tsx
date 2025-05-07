
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinRoomForm from "@/components/JoinRoomForm";
import CreateRoomForm from "@/components/CreateRoomForm";
import { Gamepad2 } from "lucide-react";

interface GameOptionsCardProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const GameOptionsCard: React.FC<GameOptionsCardProps> = ({ activeTab, onTabChange }) => {
  return (
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
        <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
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
  );
};

export default GameOptionsCard;
