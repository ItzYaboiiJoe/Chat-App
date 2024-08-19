import { useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { browserSessionPersistence } from "firebase/auth";

function SessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    auth
      .setPersistence(browserSessionPersistence)
      .then(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (!user) {
            navigate("/");
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, [navigate]);

  return null;
}

export default SessionManager;
