import React, { useState, useEffect } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import boyIcon from "../assets/portrait-young-boy-with-book-education-day.jpg";
import girlIcon from "../assets/portrait-young-student-with-book-education-day.jpg";

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

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const itemFromTopVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  const itemFromBottomVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <motion.div
      className="d-flex justify-content-center align-items-center vh-100 position-relative"
      style={{
        background: "linear-gradient(to bottom, #1e3a8a, #3b82f6)",
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Top Icons */}
      <i
        className="bi bi-globe position-absolute text-white"
        style={{
          top: "20px",
          left: "20px",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      ></i>
      <i
        className="bi bi-music-note-beamed position-absolute text-white"
        style={{
          top: "20px",
          right: "20px",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      ></i>

      {/* Card Content */}
      <Card
        className="p-4 text-white rounded-lg"
        style={{
          width: "24rem",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "1.5rem",
        }}
      >
        <motion.h2
          className="text-center mb-4 font-weight-bold"
          variants={itemFromTopVariants}
        >
          Stories about your own child
        </motion.h2>
        <Card.Body>
          <motion.div variants={itemFromTopVariants}>
            <Form.Group className="mb-4">
              <Form.Label>Child's name:</Form.Label>
              <Form.Control
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter child's name"
                className="rounded"
              />
            </Form.Group>
          </motion.div>
          <motion.div variants={itemFromTopVariants}>
            <Form.Group className="mb-4">
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
                  <img
                    src={boyIcon}
                    alt="Boy Icon"
                    className="img-fluid mb-2"
                  />
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
                  <img
                    src={girlIcon}
                    alt="Girl Icon"
                    className="img-fluid mb-2"
                  />
                  <p>Girl</p>
                </Col>
              </Row>
            </Form.Group>
          </motion.div>
          <motion.div variants={itemFromBottomVariants}>
            <Button
              onClick={handleContinue}
              className="w-100 text-dark font-weight-bold"
              style={{
                backgroundColor: "#f97316",
                borderRadius: "12px",
                border: "none",
              }}
            >
              Save and Continue
            </Button>
          </motion.div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ChildProfileScreen;
