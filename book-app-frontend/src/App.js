import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { AnimatePresence } from "framer-motion";
import HomePage from "./Pages/Homepage";
import BookPage from "./Pages/BookPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ChildProfileScreen from "./Pages/ChildProfileScreen";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import VerifyEmail from "./Pages/VerifyEmail";
import ForgotPassword from "./Pages/PasswordReset";
import ResetPassword from "./Pages/ResetPassword";
import PaymentSuccess from "./Pages/PaymentSuccess";
import backgroundMusic from "./assets/please-calm-my-mind-125566.mp3"; // Your music file
import DataDeletionPolicy from "./Pages/AccountDeletion";

function AnimatedRoutes({ toggleMusic, isMusicPlaying }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userToken, setUserToken] = useState(
    localStorage.getItem("auth_token")
  );
  const [redirectPath, setRedirectPath] = useState(window.location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setUserToken(token); // Update state when location changes
  }, [location.pathname]);

  useEffect(() => {
    const handleAppUrlOpen = (event) => {
      if (event.url) {
        try {
          const url = new URL(event.url);
          let path = url.host || url.pathname.replace(/^\/+/, "");

          setTimeout(() => {
            const token = localStorage.getItem("auth_token");
            if (!path || path === "/" || path === "open") {
              if (token) {
                navigate("/");
              }
            } else if (path === "verify-email") {
              navigate(`/verify-email?token=${url.searchParams.get("token")}`);
            } else if (path === "reset-password") {
              navigate(
                `/reset-password?token=${url.searchParams.get("token")}`
              );
            } else if (path === "login") {
              navigate("/login");
            }
          }, 500);
        } catch (error) {
          console.error("Error parsing deep link URL:", error);
        }
      }
    };

    CapacitorApp.addListener("appUrlOpen", handleAppUrlOpen);
    return () => CapacitorApp.removeAllListeners("appUrlOpen");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    console.log("Stored Token:", token);

    if (token) {
      setUserToken(token);
    }

    // Add a slight delay before setting the redirect path
    setTimeout(() => {
      setRedirectPath(window.location.pathname);
    }, 500); // Small delay (500ms) to allow deep linking to process
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            userToken ? (
              <HomePage
                toggleMusic={toggleMusic}
                isMusicPlaying={isMusicPlaying}
              />
            ) : (
              <Navigate to="/sign-up" />
            )
          }
        />

        <Route
          path="/book/:bookId/:pageId"
          element={
            userToken ? (
              <BookPage
                toggleMusic={toggleMusic}
                isMusicPlaying={isMusicPlaying}
              />
            ) : (
              <Navigate to="/sign-up" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            userToken ? <ChildProfileScreen /> : <Navigate to="/sign-up" />
          }
        />
        <Route
          path="/admin"
          element={userToken ? <AdminDashboard /> : <Navigate to="/sign-up" />}
        />

        <Route path="/sign-up" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/data-deletion" element={<DataDeletionPolicy />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef(null);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);

    if (!isMusicPlaying) {
      musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  };

  return (
    <Router>
      <audio ref={musicRef} loop>
        <source src={backgroundMusic} type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>
      <AnimatedRoutes
        toggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
      />
    </Router>
  );
}

export default App;
