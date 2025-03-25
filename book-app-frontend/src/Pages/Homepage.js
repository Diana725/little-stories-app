import React, { useState, useEffect } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./Homepage.css";
import SubscriptionModal from "../components/SubscriptionModal";
import backgroundMusic from "../assets/please-calm-my-mind-125566.mp3";

// Animation Variants
const headerVariants = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -100 },
};

const bookVariants = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
};
const gridVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const HomePage = ({ toggleMusic, isMusicPlaying }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [inputDigits, setInputDigits] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [randomDigits, setRandomDigits] = useState(""); // Store the generated random digits

  //state control for subscription modal
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  //functions to open and close subscription modal
  const handleSubscriptionModalOpen = () => {
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionModalClose = () => {
    setShowSubscriptionModal(false);
  };
  const handlePaymentSuccess = () => {
    setIsSubscribed(true);
    setShowSubscriptionModal(false); // Close the modal after success
  };

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch(
          "https://kithia.com/website_b5d91c8e/api/user/subscription-status",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription status");
        }

        const data = await response.json();

        setIsSubscribed(data.subscription_status === "active");
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();

    const interval = setInterval(checkSubscriptionStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch books from the API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          "https://kithia.com/website_b5d91c8e/api/books",
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();
        setBooks(data);
        // console.log(data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const goToBookPage = (bookId, isLocked) => {
    if (isLocked && !isSubscribed) {
      handleSubscriptionModalOpen(); // Show Subscription Modal if locked and not subscribed
    } else {
      navigate(`/book/${bookId}/1`);
    }
  };

  const goToProfilePage = () => {
    navigate("/profile");
  };

  const goToAccountPage = () => {
    navigate("/user-account");
  };

  const handleModalShow = () => {
    generateRandomDigits(); // Generate random digits when modal opens
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setInputDigits("");
    setErrorMessage("");
  };

  // Generate three random digits as a string
  const generateRandomDigits = () => {
    const digits = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    setRandomDigits(digits);
  };

  const numberToWords = (num) => {
    const words = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    return num
      .split("")
      .map((digit) => words[parseInt(digit)])
      .join(", ");
  };

  const handleInputChange = (digit) => {
    // Limit input to 3 digits
    if (inputDigits.length < 3) {
      setInputDigits((prevDigits) => prevDigits + digit);
    }
  };

  const handleClear = () => {
    setInputDigits("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputDigits === randomDigits) {
      // Redirect to Gmail compose email with your email pre-filled
      window.location.href = `mailto:support@papricut.com?subject=Support Request`;
    } else {
      setErrorMessage("The digits entered are incorrect. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          background: "linear-gradient(to bottom, #272861, #2D3B79)",
        }}
      />
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const imageBaseUrl =
    "https://kithia.com/website_b5d91c8e/book-backend/public/";

  return (
    <Container fluid className="home-page">
      {/* Sticky Header */}
      <motion.div
        className="sticky-header"
        variants={headerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6 }}
      >
        <div className="icon-container">
          <i className="bi bi-gear green-icon" onClick={goToProfilePage}></i>
          <i className="bi bi-envelope blue-icon" onClick={handleModalShow}></i>
        </div>

        {/* If the user is not subscribed, show "Unlock all books", otherwise show "Little Stories" */}
        {!isSubscribed ? (
          <button className="unlock-btn" onClick={handleSubscriptionModalOpen}>
            Unlock all books
          </button>
        ) : (
          <button className="unlock-btn">Little Stories For Children</button>
        )}

        {/* Render the subscription modal here */}
        <SubscriptionModal
          show={showSubscriptionModal}
          onClose={handleSubscriptionModalClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <i
          className={`bi ${
            isMusicPlaying ? "bi-music-note-list" : "bi-music-note"
          } music-icon`}
          onClick={toggleMusic}
        ></i>
      </motion.div>

      {/* Book Grid */}
      <motion.div
        className="book-grid"
        initial="initial"
        variants={gridVariants}
        animate="animate"
        exit="exit"
      >
        {books.map((book) => (
          <motion.div
            key={book.id}
            className="book-item"
            onClick={() => {
              // If the book is NOT the first book and the user is NOT subscribed, show the subscription modal
              if (book.id !== 1 && !isSubscribed) {
                handleSubscriptionModalOpen();
              } else {
                // Otherwise, go to the book page
                goToBookPage(book.id, book.locked);
              }
            }}
            variants={bookVariants}
            transition={{ duration: 0.6 }}
          >
            <div className="book-container">
              <img
                src={`${imageBaseUrl}${book.cover_image}`}
                alt={book.title}
                className="book-cover"
              />
              <div className="book-title-overlay">
                <h3 className="book-title">{book.title}</h3>
              </div>

              {/* Show Lock Icon if the book is NOT the first book and the user is NOT subscribed */}
              {book.id !== 1 && !isSubscribed && (
                <i className="bi bi-lock-fill book-lock"></i>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {/* Modal for input */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          dialogClassName="custom-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, y: 50, transition: { duration: 0.3 } }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="modal-title">For Dad and Mom</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              <p className="input-label">
                Input digits: {numberToWords(randomDigits)}
              </p>
              <div className="digit-display">{inputDigits}</div>

              {/* Calculator-like buttons */}
              <div className="calculator">
                {Array.from({ length: 10 }, (_, i) => (
                  <Button
                    key={i}
                    className="calculator-button"
                    onClick={() => handleInputChange(i.toString())}
                  >
                    {i}
                  </Button>
                ))}
              </div>
              <div className="modal-actions">
                <Button className="clear-button" onClick={handleClear}>
                  Clear
                </Button>
                {errorMessage && <p className="error-text">{errorMessage}</p>}
                <Button className="submit-button" onClick={handleFormSubmit}>
                  Submit
                </Button>
              </div>
            </Modal.Body>
          </motion.div>

          {/* Styles */}
          <style jsx>{`
            .custom-modal .modal-dialog {
              max-width: 400px;
              height: 100vh;
              display: flex;
              align-items: center;
            }

            .custom-modal .modal-content {
              border-radius: 15px;
              background: linear-gradient(to bottom, #272861, #2d3b79);
              color: white;
              padding: 15px;
              border: none;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }

            .modal-title {
              font-size: 1.2rem;
              font-weight: bold;
              text-align: center;
              color: white;
            }

            .modal-body {
              text-align: center;
              flex: 1;
            }

            .input-label {
              font-size: 0.9rem;
              margin-bottom: 10px;
            }

            .digit-display {
              font-size: 1rem;
              background: white;
              color: black;
              padding: 8px;
              border-radius: 6px;
              margin-bottom: 10px;
              display: inline-block;
              min-width: 120px;
            }

            .calculator {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              margin-bottom: 15px;
            }

            .calculator-button {
              width: 35px;
              height: 35px;
              border-radius: 50%;
              background: linear-gradient(to bottom, #4a90e2, #357ae8);
              color: white;
              font-size: 1rem;
              font-weight: bold;
              border: none;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            }

            .calculator-button:hover {
              background: linear-gradient(to bottom, #357ae8, #4a90e2);
            }

            .clear-button {
              background: #f44336;
              color: white;
              font-weight: bold;
              border: none;
              border-radius: 6px;
              padding: 8px 15px;
              margin-right: 8px;
            }

            .submit-button {
              background: #4caf50;
              color: white;
              font-weight: bold;
              border: none;
              border-radius: 6px;
              padding: 8px 15px;
            }

            .error-text {
              color: #ff4d4f;
              font-size: 0.85rem;
              margin-top: 5px;
            }
          `}</style>
        </Modal>
      </AnimatePresence>
      {/* {showSubscriptionModal && (
        <SubscriptionModal
          show={showModal}
          onClose={handleModalClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )} */}
    </Container>
  );
};

export default HomePage;
