import React, { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import ConfirmationModal from "../ConfirmationModal";

function ChatPage() {
  const [roomName, setRoomName] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    const roomDocRef = doc(db, "chatrooms", "chatrooms");

    const unsubscribe = onSnapshot(roomDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const rooms = Object.entries(data)
          .filter(([key]) => key.startsWith("room"))
          .map(([key, value]) => ({ id: key, name: value }));
        setAvailableRooms(rooms);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room.name);
  };

  const handleCreateRoomClick = async () => {
    if (!roomName.trim()) return;

    try {
      const roomDocRef = doc(db, "chatrooms", "chatrooms");

      const nextRoomNumber = availableRooms.length + 1;
      const newRoomFieldName = `room${nextRoomNumber}`;

      await updateDoc(roomDocRef, {
        [newRoomFieldName]: roomName,
      });

      setAvailableRooms([
        ...availableRooms,
        { id: newRoomFieldName, name: roomName },
      ]);

      setRoomName("");
    } catch (error) {
      console.error("Failed to create room: ", error.message);
    }
  };

  const handleDeleteRoomClick = (roomId) => {
    setRoomToDelete(roomId);
    setIsModalOpen(true);
  };

  const handleDeleteRoomConfirm = async () => {
    try {
      const roomDocRef = doc(db, "chatrooms", "chatrooms");

      await updateDoc(roomDocRef, {
        [roomToDelete]: deleteField(),
      });

      setAvailableRooms(
        availableRooms.filter((room) => room.id !== roomToDelete)
      );
      if (selectedRoom === roomToDelete) setSelectedRoom("");
      setIsModalOpen(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error("Failed to delete room: ", error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoomToDelete(null);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-800 text-white p-3 flex flex-col">
        <h2 className="text-xl font-semibold mb-3">Available Rooms</h2>
        <ul className="flex-grow overflow-y-auto">
          {availableRooms.map((room) => (
            <li
              key={room.id}
              className={`p-3 mb-2 rounded-lg flex justify-between items-center cursor-pointer ${
                room.name === selectedRoom ? "bg-gray-700" : "bg-gray-900"
              } hover:bg-gray-700 transition-colors`}
            >
              <span onClick={() => handleRoomClick(room)}>{room.name}</span>
              <button
                onClick={() => handleDeleteRoomClick(room.id)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <input
            type="text"
            placeholder="New room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full p-2 mb-2 border rounded-lg text-black"
          />
          <button
            onClick={handleCreateRoomClick}
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New Room
          </button>
        </div>
      </div>

      <div className="w-3/4 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedRoom}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
              <p className="text-center text-gray-500">
                Chat messages will appear here
              </p>
            </div>
            <div className="p-3 bg-gray-100 border-t flex">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                disabled
              />
              <button
                className="ml-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-grow text-gray-500">
            <h2 className="text-xl">Select a room to start chatting</h2>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteRoomConfirm}
        message="Are you sure you want to delete this room?"
      />
    </div>
  );
}

export default ChatPage;
