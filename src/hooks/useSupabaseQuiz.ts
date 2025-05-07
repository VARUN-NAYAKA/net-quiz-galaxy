
import { useState } from "react";
import { useRoomCreation } from "./useRoomCreation";
import { useRoomJoining } from "./useRoomJoining";
import { useRoomManagement } from "./useRoomManagement";

export function useSupabaseQuiz() {
  const [isLoading, setIsLoading] = useState(false);
  const { createRoom } = useRoomCreation();
  const { joinRoom } = useRoomJoining();
  const { verifyRoomPassword, getAvailableRooms } = useRoomManagement();

  return {
    createRoom,
    joinRoom,
    getAvailableRooms,
    verifyRoomPassword,
    isLoading
  };
}
