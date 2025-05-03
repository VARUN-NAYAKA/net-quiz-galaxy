
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Play, Pause, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseQuiz } from '@/hooks/useSupabaseQuiz';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface UserRoom {
  id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  creator?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  last_active: string;
}

const ManageRooms = () => {
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<UserRoom | null>(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { verifyRoomPassword } = useSupabaseQuiz();
  
  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        // Get all quiz rooms with creator info
        const { data: allRooms, error } = await supabase
          .from('quiz_rooms')
          .select(`
            id,
            code,
            created_at,
            is_active,
            players!inner(name, is_host)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Format rooms with creator info
        const formattedRooms = allRooms.map((room) => {
          const hostPlayer = room.players.find((p: any) => p.is_host);
          return {
            ...room,
            creator: hostPlayer ? hostPlayer.name : "(unknown)"
          };
        });
        
        setUserRooms(formattedRooms || []);
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
        
        // Fetch players for the room and show details
        await fetchRoomPlayers(selectedRoom.id);
        setShowRoomDetails(true);
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

  const fetchRoomPlayers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('last_active', { ascending: false });

      if (error) throw error;
      setRoomPlayers(data);
    } catch (error) {
      console.error("Error fetching room players:", error);
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
      
      // Update the selected room state
      if (selectedRoom && selectedRoom.id === room.id) {
        setSelectedRoom({...selectedRoom, is_active: newState});
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteRoom = async () => {
    if (!selectedRoom) return;
    
    try {
      // Delete all players in the room first
      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .eq('room_id', selectedRoom.id);

      if (playersError) throw playersError;

      // Then delete the room
      const { error: roomError } = await supabase
        .from('quiz_rooms')
        .delete()
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      toast({
        title: "Room Deleted",
        description: `Quiz room ${selectedRoom.code} has been permanently deleted.`,
      });

      setShowRoomDetails(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isPlayerActive = (lastActive: string) => {
    const lastActiveTime = new Date(lastActive).getTime();
    const currentTime = new Date().getTime();
    // Consider active if last active within the past 2 minutes
    return currentTime - lastActiveTime < 2 * 60 * 1000;
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{room.code}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" 
                        style={{backgroundColor: room.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                                color: room.is_active ? '#4ADE80' : '#F87171'}}>
                        {room.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      Creator: <span className="font-medium">{room.creator}</span>
                    </p>
                    <p className="text-xs text-white/70">
                      Created: {format(new Date(room.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-1"
                    onClick={() => handleRoomAction(room)}
                  >
                    <Settings className="w-4 h-4" /> Manage Room
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password.trim()) {
                  handleVerifyPassword();
                }
              }}
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

      {/* Room details dialog */}
      <Dialog open={showRoomDetails} onOpenChange={setShowRoomDetails}>
        <DialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Room Details: {selectedRoom?.code}
              <span className="text-xs px-2 py-0.5 rounded-full" 
                style={{backgroundColor: selectedRoom?.is_active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', 
                        color: selectedRoom?.is_active ? '#4ADE80' : '#F87171'}}>
                {selectedRoom?.is_active ? "Active" : "Inactive"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Created: {selectedRoom?.created_at && format(new Date(selectedRoom.created_at), 'MMM dd, yyyy HH:mm:ss')} by {selectedRoom?.creator}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => selectedRoom && toggleRoomState(selectedRoom)}
                className={selectedRoom?.is_active 
                  ? "bg-red-500/80 hover:bg-red-600 text-white"
                  : "bg-green-500/80 hover:bg-green-600 text-white"}
              >
                {selectedRoom?.is_active ? (
                  <><Pause className="w-4 h-4 mr-1" /> Suspend Room</>
                ) : (
                  <><Play className="w-4 h-4 mr-1" /> Resume Room</>
                )}
              </Button>
              
              <Button 
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="bg-red-600/80 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete Room
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Players ({roomPlayers.length})</h3>
              <div className="rounded-md border border-white/20 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/10">
                    <TableRow className="hover:bg-white/5">
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Score</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomPlayers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-white/70">No players found</TableCell>
                      </TableRow>
                    ) : (
                      roomPlayers.map((player) => (
                        <TableRow key={player.id} className="hover:bg-white/5">
                          <TableCell className="font-medium text-white">{player.name}</TableCell>
                          <TableCell className="text-white">{player.score}</TableCell>
                          <TableCell className="text-white">{player.is_host ? "Host" : "Player"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isPlayerActive(player.last_active) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {isPlayerActive(player.last_active) ? "Online" : "Offline"}
                            </span>
                          </TableCell>
                          <TableCell className="text-white/70 text-xs">{format(new Date(player.last_active), 'MMM dd, HH:mm:ss')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowRoomDetails(false)}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/30 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-lg border-white/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete the room
              and remove all associated player data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/30 bg-white/10 hover:bg-white/30 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRoom} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ManageRooms;
