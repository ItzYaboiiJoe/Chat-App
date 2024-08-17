import { useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function SessionManager() {
  const navigate = useNavigate();
  const sessionTimeoutMinutes = 5;
  const sessionExpirationTime = sessionTimeoutMinutes * 60 * 1000;

  useEffect(() => {
    auth
      .setPersistence("local")
      .then(() => {
        checkSessionExpiration();
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });

    if (auth.currentUser) {
      const expirationTimestamp = Date.now() + sessionExpirationTime;
      localStorage.setItem(
        "session_expiration",
        expirationTimestamp.toString()
      );
      if (!localStorage.getItem("username")) {
        localStorage.setItem(
          "username",
          auth.currentUser.displayName || "Guest"
        );
      }
    }

    const handleUserAction = () => {
      checkSessionExpiration();
    };

    window.addEventListener("click", handleUserAction);
    window.addEventListener("keydown", handleUserAction);

    return () => {
      window.removeEventListener("click", handleUserAction);
      window.removeEventListener("keydown", handleUserAction);
    };
  }, []);

  const checkSessionExpiration = () => {
    const expirationTimestamp = parseInt(
      localStorage.getItem("session_expiration"),
      10
    );

    if (Date.now() > expirationTimestamp) {
      auth.signOut().then(() => {
        localStorage.removeItem("session_expiration");
        localStorage.removeItem("username");
        navigate("/login");
      });
    }
  };

  return null;
}

export default SessionManager;
