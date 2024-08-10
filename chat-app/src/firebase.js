import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALroCwyVUy_Tt9iA9zrQxLb-BpJ8dzb04",
  authDomain: "chatroom-firebase-56727.firebaseapp.com",
  projectId: "chatroom-firebase-56727",
  storageBucket: "chatroom-firebase-56727.appspot.com",
  messagingSenderId: "835258107160",
  appId: "1:835258107160:web:e0e7c36a3e4004fa6e4a6d",
  measurementId: "G-P3MMB4X5Y0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };
