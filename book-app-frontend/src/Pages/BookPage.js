import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BookPage.css";
import ActionIcons from "./ActionIcons";

const BookPage = () => {
  const { bookId, pageId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [bookPages, setBookPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [isNextPageImagePreloaded, setIsNextPageImagePreloaded] =
    useState(false);

  const imageBaseUrl = "http://127.0.0.1:8000/";

  useEffect(() => {
    // Fetch the book pages from the API
    const fetchBookPages = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/books/${bookId}/pages`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pages");
        }
        const data = await response.json();
        setBookPages(data);
      } catch (error) {
        console.error("Error fetching book pages:", error);
      }
    };

    fetchBookPages();
  }, [bookId]);

  useEffect(() => {
    // Find the current page by the pageId from the URL
    const page = bookPages.find(
      (page) => page.page_number === parseInt(pageId)
    );
    setCurrentPage(page);
  }, [bookPages, pageId]);

  useEffect(() => {
    // Preload the next page image (for smoother transitions)
    if (bookPages.length > 0) {
      const nextPage = bookPages.find(
        (page) => page.page_number === parseInt(pageId) + 1
      );

      if (nextPage?.image && !isNextPageImagePreloaded) {
        const img = new Image();
        img.src = `${imageBaseUrl}${nextPage.image}`;
        img.onload = () => {
          setIsNextPageImagePreloaded(true);
        };
      }
    }
  }, [bookPages, pageId, isNextPageImagePreloaded]);

  const goToPage = (newPageId) => {
    navigate(`/book/${bookId}/${newPageId}`);
  };

  // Split the text by periods for displaying each sentence on its own line
  const sentences = currentPage?.words?.split(/\. ?/).filter(Boolean);

  // Function to show the modal when the home icon is clicked
  const handleHomeClick = () => {
    setShowModal(true);
  };

  // Function to close the modal and navigate to home
  const handleConfirmHomeNavigation = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div
      className="book-page"
      style={{
        backgroundImage: currentPage?.image
          ? `url("${imageBaseUrl}${currentPage.image}")`
          : "none",
        objectFit: "fill",
      }}
    >
      {/* Floating Header Icons */}
      <div className="header-icons">
        <div className="left-icon-container">
          <i
            className="bi bi-house home-icon"
            onClick={handleHomeClick} // Open modal on click
          ></i>
          <div className="page-number">
            {pageId}/{bookPages.length}
          </div>
        </div>
        <i className="bi bi-music-note-beamed music-icon"></i>
      </div>

      {/* Floating Action Icons */}
      <ActionIcons bookId={bookId} pageNumber={parseInt(pageId)} />

      {/* Floating Navigation Buttons */}
      <div className="navigation-buttons">
        {parseInt(pageId) > 1 && (
          <button
            className="nav-btn left-btn"
            onClick={() => goToPage(parseInt(pageId) - 1)}
          >
            <i
              className="bi bi-chevron-left"
              style={{ fontSize: "1.8rem" }}
            ></i>
          </button>
        )}
        <div className="page-text">
          {sentences?.map((sentence, index) => (
            <p key={index}>{sentence.trim()}.</p> // Add back period and display each sentence on its own line
          ))}
        </div>
        {parseInt(pageId) < bookPages.length && (
          <button
            className="nav-btn right-btn"
            onClick={() => goToPage(parseInt(pageId) + 1)}
          >
            <i
              className="bi bi-chevron-right"
              style={{ fontSize: "1.8rem" }}
            ></i>
          </button>
        )}
      </div>

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Modal backdrop customization
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content custom-popup">
            <div className="modal-header">
              <h5 className="custom-title">ARE YOU LEAVING?</h5>
            </div>
            <div className="modal-body">
              <button
                type="button"
                className="custom-btn-no"
                onClick={() => setShowModal(false)}
              >
                NO
              </button>
              <button
                type="button"
                className="custom-btn-yes"
                onClick={handleConfirmHomeNavigation}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
