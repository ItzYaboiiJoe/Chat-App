import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, analytics, db } from "../firebase";
import { logEvent } from "firebase/analytics";
import {
  doc,
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Import necessary Firestore functions
import Logo from "/logo.svg";

function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const normalizedUsername = username.toLowerCase();

      // Check if the username already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", normalizedUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Username already exists. Please choose another one.");
        return; // Stop the process if the username exists
      }

      // Create a user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      logEvent(analytics, "sign_up", { method: "email" });

      // Add user data to Firestore with verification status and Firestore Timestamp
      await setDoc(doc(db, "users", user.uid), {
        username: normalizedUsername,
        email: user.email,
        isVerified: false,
        verificationSentAt: Timestamp.now(),
      });

      // Send email verification
      await sendEmailVerification(user);
      setSuccess(
        "Account created successfully! A verification email has been sent. Please verify your email before logging in."
      );
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Logo" className="h-16" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create Account
            </button>
            <Link to="/" className="text-sm text-blue-500 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAccountPage;
