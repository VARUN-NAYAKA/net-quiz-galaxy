
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';

interface UserRoom {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
}

const ManageRooms = () => {
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<UserRoom | null>(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();
  const { verifyRoomPassword } = useSupabaseQuiz();
  
  useEffect(() => {
    const fetchUserRooms = async () => {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserRooms([]);
        setLoading(false);
        return;
      }
      
      try {
        // Get all quiz rooms
        const { data: allRooms, error } = await supabase
          .from('quiz_rooms')
          .select(`
            id,
            code,
            created_at,
            is_active
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUserRooms(allRooms || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRooms();
    
    // Set up a subscription for real-time updates
    const roomsSubscription = supabase
      .channel('user-rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_rooms' }, fetchUserRooms)
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, []);

  const handleRoomAction = (room: UserRoom) => {
    setSelectedRoom(room);
    setShowPasswordDialog(true);
    setPassword('');
  };

  const handleVerifyPassword = async () => {
    if (!selectedRoom) return;
    
    setVerifying(true);
    
    try {
      const isValid = await verifyRoomPassword(selectedRoom.code, password);
      
      if (isValid) {
        setShowPasswordDialog(false);
        setPassword('');
        
        // Toggle room active state
        await toggleRoomState(selectedRoom);
      } else {
        toast({
          title: "Incorrect Password",
          description: "The password you entered is incorrect.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const toggleRoomState = async (room: UserRoom) => {
    try {
      const newState = !room.is_active;
      
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ is_active: newState })
        .eq('id', room.id);

      if (error) throw error;

      toast({
        title: newState ? "Room Activated" : "Room Deactivated",
        description: `Quiz room ${room.code} is now ${newState ? "active" : "inactive"}.`,
      });
      
      // The list will update automatically due to the subscription
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
      <CardContent className="pt-6">
        {!supabase.auth.getSession() && (
          <div className="text-center py-4">
            <p className="mb-3 text-white/80">Sign in to manage your quiz rooms</p>
          </div>
        )}
        
        {loading ? (
          <p className="text-center text-white/70">Loading rooms...</p>
        ) : userRooms.length === 0 ? (
          <p className="text-center text-white/70">No rooms found</p>
        ) : (
          <div className="space-y-2">
            {userRooms.map(room => (
              <Card key={room.id} className="p-3 bg-white/5 text-white border-white/20 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{room.code}</p>
                    <p className="text-xs text-white/70">
                      Created: {new Date(room.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium mt-1" style={{color: room.is_active ? '#4ADE80' : '#F87171'}}>
                      {room.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={room.is_active ? "destructive" : "default"} 
                    className={room.is_active 
                      ? "bg-red-500/80 hover:bg-red-600 text-white" 
                      : "bg-green-500/80 hover:bg-green-600 text-white"}
                    onClick={() => handleRoomAction(room)}
                  >
                    {room.is_active ? (
                      <><Pause className="w-4 h-4 mr-1" /> Suspend</>
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Resume</>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Password verification dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white">
          <DialogHeader>
            <DialogTitle>Verify Room Password</DialogTitle>
            <DialogDescription className="text-white/70">
              Enter the password for room {selectedRoom?.code} to manage it
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="room-password" className="text-white">Room Password</Label>
            <Input 
              id="room-password" 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password"
              className="mt-2 bg-white/20 border-white/30 text-white placeholder:text-white/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-white/30 bg-white/10 hover:bg-white/30 text-white">
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyPassword} 
              disabled={verifying || !password.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {verifying ? "Verifying..." : "Verify & Manage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ManageRooms;
