import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

// Animation Variants
const headerVariants = {
  initial: { opacity: 0, y: -100 }, // Starts above the viewport
  animate: { opacity: 1, y: 0 }, // Moves to its normal position
  exit: { opacity: 0, y: -100 }, // Exits upwards
};

const bookVariants = {
  initial: { opacity: 0, y: 100 }, // Starts below the viewport
  animate: { opacity: 1, y: 0 }, // Moves to its normal position
  exit: { opacity: 0, y: 100 }, // Exits downwards
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    // Add music play/stop logic here
  };

  // Fetch books from the API using fetch
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const goToBookPage = (bookId) => {
    navigate(`/book/${bookId}/1`); // Navigate to the first page of the book
  };

  const goToProfilePage = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  if (loading) {
    return <div>Loading books...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const imageBaseUrl = "http://127.0.0.1:8000/";

  return (
    <Container fluid className="home-page">
      {/* Sticky Header */}
      <motion.div
        className="sticky-header"
        variants={headerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.8 }}
      >
        <div className="icon-container">
          <i className="bi bi-gear green-icon" onClick={goToProfilePage}></i>
          <i className="bi bi-envelope blue-icon"></i>
        </div>
        <button className="unlock-btn">Unlock all books</button>
        <i
          className={`bi ${
            isMusicPlaying ? "bi-music-note-beamed" : "bi-music-note-list"
          } music-icon`}
          onClick={toggleMusic}
        ></i>
      </motion.div>

      {/* Book Grid */}
      <motion.div
        className="book-grid"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {books.map((book) => (
          <motion.div
            key={book.id}
            className="book-item"
            onClick={() => goToBookPage(book.id)}
            variants={bookVariants}
            transition={{ duration: 0.8, delay: 0.2 * book.id }} // Delay for staggered effect
          >
            <div className="book-container">
              {/* Display book cover using the full image URL */}
              <img
                src={`${imageBaseUrl}${book.cover_image}`}
                alt={book.title}
                className="book-cover"
              />
              <i className="bi bi-lock-fill book-lock"></i>
            </div>
            <h3 className="book-title">{book.title}</h3>
          </motion.div>
        ))}
      </motion.div>
    </Container>
  );
};

export default HomePage;
