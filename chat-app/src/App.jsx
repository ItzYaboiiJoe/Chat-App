import LoginPage from "./Pages/LoginPage";
import CreateAccountPage from "./Pages/CreateAccountPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ChatPage from "./Pages/ChatPage";
import SessionManager from "./Components/SessionManager";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <SessionManager />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/chat-page" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
