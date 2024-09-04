import { useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { browserSessionPersistence } from "firebase/auth";

function SessionManager() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    auth
      .setPersistence(browserSessionPersistence)
      .then(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          const publicPaths = ["/forgot-password", "/create-account"];

          if (!user && !publicPaths.includes(location.pathname)) {
            navigate("/");
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, [navigate, location.pathname]);

  return null;
}

export default SessionManager;
