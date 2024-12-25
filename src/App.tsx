import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthRequired } from "./components/AuthRequired";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Chat } from "./pages/Chat";
import { ConnectionsPage } from "./pages/connections";
import "./App.css";

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chat"
          element={
            <AuthRequired>
              <Chat />
            </AuthRequired>
          }
        />
        <Route
          path="/connections"
          element={
            <AuthRequired>
              <ConnectionsPage />
            </AuthRequired>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;