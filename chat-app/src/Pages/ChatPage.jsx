import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import SignOutConfirmation from "../Components/SignOutConfirmation";

function ChatPage() {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // Reference to the end of the messages list
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
        } else {
          setUsername("Guest");
        }
      };

      fetchUsername();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chatrooms"), (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.id,
      }));
      setAvailableRooms(rooms);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const roomDocRef = doc(db, "chatrooms", selectedRoom);

      const unsubscribe = onSnapshot(roomDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const messages = Object.keys(data)
            .filter((key) => key.startsWith("message_"))
            .map((key) => data[key]);

          setMessages(messages);
          scrollToBottom(); // Scroll to the bottom when messages are updated
        }
      });

      return () => unsubscribe();
    }
  }, [selectedRoom]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room.id);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!selectedRoom || !message.trim()) return;

    try {
      const roomDocRef = doc(db, "chatrooms", selectedRoom);

      const timestamp = new Date().getTime();
      const newMessageField = `message_${timestamp}`;

      await updateDoc(roomDocRef, {
        [newMessageField]: {
          username: username,
          message: message,
          timestamp: new Date(),
        },
      });

      setMessage("");
      scrollToBottom(); // Scroll to the bottom after sending a message
    } catch (error) {
      console.error("Failed to send message: ", error.message);
    }
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

  // Function to scroll to the bottom of the messages list
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

        <div className="flex-grow flex flex-col">
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
                <span>{room.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full md:w-3/4 flex flex-col h-full">
        {selectedRoom ? (
          <>
            <div className="bg-gray-100 p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedRoom}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
              <ul>
                {messages.map((msg) => (
                  <li key={msg.id} className="mb-3">
                    <div className="text-sm">
                      <strong>{msg.username}</strong>: {msg.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      <em>
                        {new Date(msg.timestamp?.toDate()).toLocaleString()}
                      </em>
                    </div>
                  </li>
                ))}
                <div ref={messagesEndRef} />{" "}
                {/* Reference to the end of the messages list */}
              </ul>
            </div>

            <div className="p-3 bg-gray-100 border-t flex-none">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-grow text-gray-500">
            <h2 className="text-xl">Select a room to start chatting</h2>
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
