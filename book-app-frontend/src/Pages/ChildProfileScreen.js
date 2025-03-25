import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsHouse, BsPersonFill, BsPersonFillGear } from "react-icons/bs";
import LogoutButton from "../components/LogoutButton";

const ChildProfileScreen = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("");

  // Load profile data from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("childName");
    const storedGender = localStorage.getItem("gender");

    if (storedName) setChildName(storedName);
    if (storedGender) setGender(storedGender);
  }, []);

  const handleContinue = () => {
    if (childName && gender) {
      localStorage.setItem("childName", childName);
      localStorage.setItem("gender", gender);
      navigate("/");
    } else {
      alert("Please enter a name and select a gender.");
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const topItemVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const bottomItemVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleConfirmHomeNavigation = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(
        "https://kithia.com/website_b5d91c8e/api/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        localStorage.removeItem("auth_token");
        navigate("/login");
      } else {
        console.error("Logout failed", await response.json());
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <motion.div
      className="d-flex justify-content-center align-items-center vh-100 position-relative"
      style={{
        background: "linear-gradient(to bottom, #272861, #2D3B79)",
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      // exit="exit"
    >
      {/* Top Icons */}
      {/* Top Icons */}
      <motion.div
        className="position-absolute text-white"
        style={{
          top: "20px",
          left: "20px",
          fontSize: "1.8rem",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
        variants={topItemVariants}
      >
        <BsHouse />
      </motion.div>

      <motion.div
        className="position-absolute"
        style={{
          top: "20px",
          right: "120px",
          fontSize: "1.8rem",
          cursor: "pointer",
        }}
        variants={topItemVariants}
      >
        <LogoutButton onLogout={handleLogout} />
      </motion.div>

      {/* Card Content */}
      <motion.div
        className="p-4 text-white rounded-lg vh-100"
        style={{
          width: "24rem",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "1.5rem",
        }}
        variants={bottomItemVariants}
      >
        <h2
          className="text-center font-weight-bold mb-1"
          style={{ fontSize: 18 }}
        >
          Stories about your own child
        </h2>

        <Card.Body>
          <Form.Group>
            <Form.Label style={{ fontSize: 14 }}>Child's name:</Form.Label>
            <Form.Control
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter child's name"
              className="rounded"
              style={{ fontSize: 14 }}
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>Gender:</Form.Label>
            <Row>
              <Col
                xs={6}
                className={`text-center border rounded py-3 ${
                  gender === "male" ? "border-warning" : "border-secondary"
                }`}
                onClick={() => setGender("male")}
                style={{ cursor: "pointer" }}
              >
                <BsPersonFill size={40} className="mb-2" />
                <p>Boy</p>
              </Col>
              <Col
                xs={6}
                className={`text-center border rounded py-3 ${
                  gender === "female" ? "border-warning" : "border-secondary"
                }`}
                onClick={() => setGender("female")}
                style={{ cursor: "pointer" }}
              >
                <BsPersonFillGear size={40} className="mb-2" />
                <p>Girl</p>
              </Col>
            </Row>
          </Form.Group>

          <Button
            onClick={handleContinue}
            className="w-100 text-dark font-weight-bold mt-1"
            style={{
              backgroundColor: "#f97316",
              borderRadius: "12px",
              border: "none",
            }}
          >
            Save and Continue
          </Button>
        </Card.Body>
      </motion.div>
    </motion.div>
  );
};

export default ChildProfileScreen;
