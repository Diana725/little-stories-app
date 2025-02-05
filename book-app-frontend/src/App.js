import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./Pages/Homepage";
import BookPage from "./Pages/BookPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ChildProfileScreen from "./Pages/ChildProfileScreen";
import AdminDashboard from "./Pages/Admin/AdminDashboard";

function AnimatedRoutes() {
  const location = useLocation(); // useLocation must be inside Router

  useEffect(() => {
    // Check if a token already exists in localStorage
    let userToken = localStorage.getItem("user_token");

    // If token doesn't exist, create a new one by hitting the backend API
    if (!userToken) {
      fetch("http://127.0.0.1:8000/api/session/start")
        .then((response) => response.json())
        .then((data) => {
          userToken = data.token; // Get the token from the backend response
          localStorage.setItem("user_token", userToken); // Store the token in localStorage
        })
        .catch((error) => {
          console.error("Error generating token:", error);
        });
    }
  }, []);

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:bookId/:pageId" element={<BookPage />} />
        <Route path="/profile" element={<ChildProfileScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes /> {/* Keep everything inside the Router */}
    </Router>
  );
}

export default App;
