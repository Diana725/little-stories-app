import React, { useState, useEffect, useRef } from "react";

const ActionIcons = ({ bookId, pageNumber }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]); // Stores audio chunks
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(""); // Audio URL state
  const audioRef = useRef(null);

  // Cleanup the object URL to avoid memory leaks
  useEffect(() => {
    if (audioURL) {
      return () => {
        URL.revokeObjectURL(audioURL); // Clean up the object URL
      };
    }
  }, [audioURL]);

  // Start recording audio
  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); // Use 'audio/webm' instead of 'audio/wav'
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" }); // Save as .webm
        setAudioChunks(chunks); // Store the chunks
        const url = URL.createObjectURL(blob); // Create an object URL for playback
        setAudioURL(url); // Set the audio URL for the player
        setIsRecording(false); // Stop recording
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
      setIsRecording(false); // Stop the recording state
    }
  };

  // Delete the recorded audio
  const deleteAudio = () => {
    setAudioURL(""); // Reset audio URL
    setAudioChunks([]); // Reset audio chunks
  };

  // Upload audio to the server
  const uploadAudio = async () => {
    const formData = new FormData();
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" }); // Save as .webm
    const audioFile = new File([audioBlob], "recording.webm", {
      type: "audio/webm",
    }); // Correct MIME type for .webm

    formData.append("audio", audioFile); // Append audio to form data
    formData.append("book_id", bookId); // Append book ID
    formData.append("page_number", pageNumber); // Append page number

    const userToken = localStorage.getItem("user_token");

    try {
      const response = await fetch("http://localhost:8000/api/audio/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Audio uploaded successfully", result);
      } else {
        console.error("Error uploading audio", result);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const fetchAudio = async (bookId, pageNumber) => {
    try {
      const userToken = localStorage.getItem("user_token");
      if (!userToken) {
        console.error("No user token found in local storage");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/audio/${bookId}/${pageNumber}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        const audioUrl = result.audio_url;
        console.log("Playing audio from:", audioUrl);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error("Audio not found:", result.error);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  // Handle playback of the audio
  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
    }
  };

  return (
    <div className="action-icons">
      <i
        className="bi bi-mic red-icon"
        onClick={startRecording}
        title="Record"
      ></i>
      <i
        className="bi bi-stop red-icon"
        onClick={stopRecording}
        title="Stop"
      ></i>

      {/* Conditionally render audio player only if audioURL is available */}
      {audioURL && !isRecording && (
        <div className="playback-controls">
          <audio
            ref={audioRef}
            src={audioURL}
            controls
            onPlay={handleAudioPlay} // Reset currentTime when played
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Number.MAX_SAFE_INTEGER; // Avoid indefinite duration issue
              }
            }}
          />
          <button onClick={uploadAudio}>Upload</button>
          <button onClick={deleteAudio}>Delete</button>
        </div>
      )}
      <i
        className="bi bi-headphones red-icon"
        onClick={() => fetchAudio(bookId, pageNumber)}
        title="Listen"
      ></i>
    </div>
  );
};

export default ActionIcons;
