import LoginPage from "./Pages/LoginPage";
import CreateAccountPage from "./Pages/CreateAccountPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ChatPage from "./Pages/ChatPage";
import SessionManager from "./Components/SessionManager";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmailVerificationListener from "./Components/EmailVerificationListener";
import TermsAndPolicyPage from "./Pages/TermsAndPolicyPage";

function App() {
  return (
    <Router>
      <EmailVerificationListener />
      <SessionManager />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/chat-page" element={<ChatPage />} />
        <Route path="/terms-and-policy" element={<TermsAndPolicyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
