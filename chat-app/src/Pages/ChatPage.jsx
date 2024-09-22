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
import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi"; // Hamburger icon

function ChatPage() {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state for mobile
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Fetch current user and set username
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

  // Fetch available rooms
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

  // Fetch messages and typing status for selected room
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
          setTypingStatus(data.typingStatus || "");
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
    setIsSidebarOpen(false); // Close sidebar on room selection in mobile
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
        typingStatus: "",
      });

      setMessage("");
      setIsTyping(false);
    } catch (error) {
      console.error("Failed to send message: ", error.message);
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

    setTimeout(async () => {
      setIsTyping(false);
      await updateDoc(doc(db, "chatrooms", selectedRoom), {
        typingStatus: "",
      });
    }, 3000);
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`fixed z-10 inset-y-0 left-0 w-64 bg-gray-800 text-white p-3 transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:relative md:flex md:flex-col`}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Welcome, {username}!</h3>
            </div>
            <button
              onClick={handleSignOutClick}
              className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 text-md whitespace-nowrap"
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
                  className={`p-3 mb-2 rounded-lg cursor-pointer ${
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

        {/* Main chat area */}
        <div className="w-full flex flex-col">
          {/* Hamburger button for mobile */}
          <div className="md:hidden p-4 bg-gray-200 flex justify-between items-center">
            <FiMenu
              className="text-2xl cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <h2 className="text-xl font-semibold">{selectedRoom}</h2>
          </div>

          {selectedRoom ? (
            <>
              <div className="bg-gray-200 p-4 border-b hidden md:block">
                <h2 className="text-xl font-semibold">{selectedRoom}</h2>
              </div>
              <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
                <ul>
                  {messages.map((msg, index) => (
                    <motion.li
                      key={index}
                      className="mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
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
                <p className="text-sm text-gray-500 pl-4">{typingStatus}</p>
              )}

              <div className="p-3 bg-gray-200 border-t flex-none">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
