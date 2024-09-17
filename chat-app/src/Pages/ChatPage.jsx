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
import SessionManager from "../Components/SessionManager";
import Logo from "/logo.svg";
import { motion } from "framer-motion"; // Import Framer Motion

function ChatPage() {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState(""); // Typing status for the room
  const [isTyping, setIsTyping] = useState(false); // Local typing state
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const email = currentUser.email;

      const fetchUsername = async () => {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const fetchedUsername = userDoc.data().username;
          setUsername(fetchedUsername);
          localStorage.setItem("username", fetchedUsername);
        }
      };

      fetchUsername();
    } else {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
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
            .map((key) => data[key])
            .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

          setMessages(messages);
          setTypingStatus(data.typingStatus || ""); // Get typing status from Firestore
        }
      });

      return () => unsubscribe();
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        typingStatus: "", // Reset typing status after sending message
      });

      setMessage("");
      setIsTyping(false); // Reset typing state
    } catch (error) {
      console.error("Failed to send message: ", error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleTyping = async (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      await updateDoc(doc(db, "chatrooms", selectedRoom), {
        typingStatus: `${username} is typing...`,
      });
    }

    // Throttle typing indicator reset
    setTimeout(async () => {
      setIsTyping(false);
      await updateDoc(doc(db, "chatrooms", selectedRoom), {
        typingStatus: "",
      });
    }, 3000); // Set typing status to stop after 3 seconds of inactivity
  };

  const handleSignOutClick = () => {
    setIsSignOutModalOpen(true);
  };

  const handleSignOutConfirm = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("username");
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out: ", error.message);
    }
  };

  const handleCloseSignOutModal = () => {
    setIsSignOutModalOpen(false);
  };

  return (
    <>
      <SessionManager />
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

          <div className="mt-auto flex justify-center mb-4">
            <img src={Logo} alt="Logo" className="h-10" />
          </div>
        </div>

        <div className="w-full md:w-3/4 flex flex-col h-full">
          {selectedRoom ? (
            <>
              <div className="bg-gray-100 p-4 border-b">
                <h2 className="text-xl font-semibold">{selectedRoom}</h2>
                {/* {typingStatus && (
                  <p className="text-sm text-gray-500">{typingStatus}</p>
                )} */}
              </div>
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                <ul>
                  {messages.map((msg, index) => (
                    <motion.li
                      key={index}
                      className="mb-3"
                      initial={{ opacity: 0 }} // Initial state
                      animate={{ opacity: 1 }} // Animation state
                      transition={{ duration: 1 }} // Animation duration
                    >
                      <div className="text-sm">
                        <strong>{msg.username}</strong>: {msg.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        <em>
                          {new Date(msg.timestamp?.toDate()).toLocaleString()}
                        </em>
                      </div>
                    </motion.li>
                  ))}
                  <div ref={messagesEndRef} />
                </ul>
              </div>
              {typingStatus && (
                <p className="text-sm text-gray-500">{typingStatus}</p>
              )}
              <div className="p-3 bg-gray-100 border-t flex-none">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={handleTyping}
                    onKeyDown={handleKeyPress}
                    className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    </>
  );
}

export default ChatPage;
