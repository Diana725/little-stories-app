import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BookPage.css";
import ActionIcons from "./ActionIcons";

const BookPage = ({ toggleMusic, isMusicPlaying }) => {
  const { bookId, pageId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [bookPages, setBookPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState({});

  const imageBaseUrl =
    "https://kithia.com/website_b5d91c8e/book-backend/public/";

  useEffect(() => {
    const fetchBookPages = async () => {
      const cachedPages = localStorage.getItem(`bookPages_${bookId}`);

      if (cachedPages) {
        // console.log("Loaded pages from cache");
        setBookPages(JSON.parse(cachedPages));
        return;
      }

      try {
        const response = await fetch(
          `https://kithia.com/website_b5d91c8e/api/books/${bookId}/pages`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pages");
        }
        const data = await response.json();
        console.log("Fetched pages from API:", data);

        setBookPages(data);
        localStorage.setItem(`bookPages_${bookId}`, JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching book pages:", error);
      }
    };

    fetchBookPages();
  }, [bookId]);

  useEffect(() => {
    if (!bookPages.length) return;

    const newPage = bookPages.find(
      (page) => page.page_number === parseInt(pageId)
    );
    if (!newPage) return;

    setCurrentPage(newPage);

    if (preloadedImages[newPage.page_number]) return;
    const img = new Image();
    img.src = `${imageBaseUrl}${newPage.image}`;
    img.onload = () => {
      setPreloadedImages((prev) => ({
        ...prev,
        [newPage.page_number]: img.src,
      }));
    };
  }, [bookPages, pageId, preloadedImages]);

  useEffect(() => {
    if (!bookPages.length) return;

    const nextPage = bookPages.find(
      (page) => page.page_number === parseInt(pageId) + 1
    );
    const prevPage = bookPages.find(
      (page) => page.page_number === parseInt(pageId) - 1
    );

    const preloadImage = (page) => {
      if (page?.image && !preloadedImages[page.page_number]) {
        const img = new Image();
        img.src = `${imageBaseUrl}${page.image}`;
        img.onload = () => {
          setPreloadedImages((prev) => ({
            ...prev,
            [page.page_number]: img.src,
          }));
        };
      }
    };

    preloadImage(nextPage);
    preloadImage(prevPage);
  }, [bookPages, pageId]);

  // Handle page navigation without causing full reload
  const goToPage = (newPageId) => {
    navigate(`/book/${bookId}/${newPageId}`);
  };

  const sentences = currentPage?.words?.split(/\. ?/).filter(Boolean) || [];

  const handleHomeClick = () => {
    setShowModal(true);
  };

  const handleConfirmHomeNavigation = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div
      className="book-page"
      style={{
        backgroundImage: `url("${
          preloadedImages[currentPage?.page_number] ||
          (currentPage?.image ? `${imageBaseUrl}${currentPage.image}` : "")
        }")`,
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
        <i
          className={`bi ${
            isMusicPlaying ? "bi-music-note-list" : "bi-music-note"
          } music-icon bookpage-music`}
          onClick={toggleMusic}
        ></i>
      </div>

      {/* Floating Action Icons */}
      <ActionIcons bookId={bookId} pageNumber={parseInt(pageId)} />

      {/* Floating Navigation Buttons */}
      <div className="navigation-buttons">
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

          {/* Book Text Display */}
          <div className="page-text">
            {sentences.length > 0 ? (
              sentences.map((sentence, index) => (
                <p key={index}>{sentence.trim()}.</p>
              ))
            ) : (
              <p></p>
            )}
          </div>

          {parseInt(pageId) <
            Math.max(...bookPages.map((page) => page.page_number)) && (
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
