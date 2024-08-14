import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import SignOutConfirmation from "../Components/SignOutConfirmation";

function ChatPage() {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("rooms");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const email = currentUser.email;

      const fetchUsername = async () => {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUsername(userDoc.data().username);
        }
      };

      fetchUsername();
    }
  }, []);

  useEffect(() => {
    if (selectedOption === "rooms") {
      const roomCollectionRef = collection(db, "chatrooms");

      const unsubscribe = onSnapshot(roomCollectionRef, (querySnapshot) => {
        const rooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableRooms(rooms);
      });

      return () => unsubscribe();
    } else if (selectedOption === "users") {
      const fetchUsers = async () => {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const email = currentUser.email;

          const q = query(collection(db, "users"), where("email", "!=", email));
          const usersSnapshot = await getDocs(q);
          const usersList = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAvailableUsers(usersList);
        }
      };

      fetchUsers();
    }
  }, [selectedOption]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room.id);
    setSelectedUser(null);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedRoom("");
  };

  const handleSignOutClick = () => {
    setIsSignOutModalOpen(true);
  };

  const handleSignOutConfirm = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out: ", error.message);
    }
  };

  const handleCloseSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/4 bg-gray-800 text-white p-3 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold">Welcome, {username}!</h3>
          </div>
          <button
            onClick={handleSignOutClick}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="flex flex-col mb-8">
          <button
            onClick={() => setSelectedOption("rooms")}
            className={`p-3 mb-2 rounded-lg flex items-center ${
              selectedOption === "rooms" ? "bg-gray-700" : "bg-gray-800"
            } hover:bg-gray-700 transition-colors`}
          >
            <span className="ml-2">Rooms</span>
          </button>
          <button
            onClick={() => setSelectedOption("users")}
            className={`p-3 mb-2 rounded-lg flex items-center ${
              selectedOption === "users" ? "bg-gray-700" : "bg-gray-800"
            } hover:bg-gray-700 transition-colors`}
          >
            <span className="ml-2">Users</span>
          </button>
        </div>

        {selectedOption === "rooms" && (
          <div className="flex-grow flex flex-col">
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-3">Available Rooms</h2>
              <ul className="overflow-y-auto">
                {availableRooms.map((room) => (
                  <li
                    key={room.id}
                    className={`p-3 mb-2 rounded-lg flex justify-between items-center cursor-pointer ${
                      room.id === selectedRoom ? "bg-gray-700" : "bg-gray-900"
                    } hover:bg-gray-700 transition-colors`}
                    onClick={() => handleRoomClick(room)}
                  >
                    <span>{room.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedOption === "users" && (
          <div className="flex-grow flex flex-col">
            <h2 className="text-xl font-semibold mb-3">Available Users</h2>
            <ul className="flex-grow overflow-y-auto max-h-40 md:max-h-80">
              {availableUsers.map((user) => (
                <li
                  key={user.id}
                  className={`p-3 mb-2 rounded-lg flex justify-between items-center cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors`}
                  onClick={() => handleUserClick(user)}
                >
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="w-full md:w-3/4 flex flex-col">
        {selectedRoom || selectedUser ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h2 className="text-xl font-semibold">
                {selectedRoom ? selectedRoom : selectedUser?.username}
              </h2>
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
            <h2 className="text-xl">
              {selectedOption === "rooms"
                ? "Select a room to start chatting"
                : "Select a user to start chatting"}
            </h2>
          </div>
        )}
      </div>

      <SignOutConfirmation
        isOpen={isSignOutModalOpen}
        onClose={handleCloseSignOutModal}
        onConfirm={handleSignOutConfirm}
        message="Are you sure you want to sign out?"
      />
    </div>
  );
}

export default ChatPage;
