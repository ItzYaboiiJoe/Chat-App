import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const EmailVerificationListener = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            isVerified: true,
          });
        } catch (error) {
          console.error(
            "Error updating user verification status in Firestore:",
            error
          );
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default EmailVerificationListener;
