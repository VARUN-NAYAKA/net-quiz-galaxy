
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinRoomForm from "@/components/JoinRoomForm";
import CreateRoomForm from "@/components/CreateRoomForm";
import { supabase } from "@/integrations/supabase/client";

const QuizLobby = () => {
  const [activeTab, setActiveTab] = useState("join");

  return (
    <div className="container mx-auto max-w-md p-4 h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Quiz Game</CardTitle>
          <CardDescription className="text-center">
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
  );
};

export default QuizLobby;
