import LoginPage from "./Pages/LoginPage";
import CreateAccountPage from "./Pages/CreateAccountPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
