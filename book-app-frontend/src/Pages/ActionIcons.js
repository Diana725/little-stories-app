import React, { useState, useEffect, useRef } from "react";
import { VoiceRecorder } from "capacitor-voice-recorder";
import "./BookPage.css";

const ActionIcons = ({ bookId, pageNumber }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book"); // Default to 'book' icon selected
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [audioNotFoundMessage, setAudioNotFoundMessage] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioURL) {
      return () => {
        URL.revokeObjectURL(audioURL);
      };
    }
  }, [audioURL]);

  const requestMicrophonePermission = async () => {
    const permission = await VoiceRecorder.requestAudioRecordingPermission();
    if (!permission.value) {
      alert("Microphone permission is required to record audio.");
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    setIsRecording(true);
    setSelectedIcon("mic"); // Highlight the mic icon when recording

    // IMPORTANT: Start the recording
    await VoiceRecorder.startRecording();
  };

  const stopRecording = async () => {
    const result = await VoiceRecorder.stopRecording();
    setIsRecording(false);

    if (result.value && result.value.recordDataBase64) {
      const audioBlob = new Blob(
        [
          new Uint8Array(
            atob(result.value.recordDataBase64)
              .split("")
              .map((char) => char.charCodeAt(0))
          ),
        ],
        { type: "audio/mp4" }
      );

      const audioURL = URL.createObjectURL(audioBlob);
      setAudioURL(audioURL);
    }
    setSelectedIcon(""); // Reset icon state after stopping
  };

  const deleteAudio = () => {
    setAudioURL("");
    setSelectedIcon("book"); // Reset to "read" icon after deleting
  };

  const uploadAudio = async () => {
    if (!audioURL) return;

    const response = await fetch(audioURL);
    const audioBlob = await response.blob();
    const audioFile = new File([audioBlob], "recording.mp4", {
      type: "audio/mp4",
    });

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("book_id", bookId);
    formData.append("page_number", pageNumber);

    const userToken = localStorage.getItem("auth_token");
    console.log("Auth Token:", userToken);

    if (!userToken) {
      console.error("No auth token found!");
      return;
    }

    try {
      const response = await fetch(
        "https://kithia.com/website_b5d91c8e/api/audio/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      // Log status code
      console.log("Response Status:", response.status);

      // Log raw response text
      const responseText = await response.text();
      console.log("Raw Response:", responseText);

      // Try parsing JSON
      try {
        const result = JSON.parse(responseText);
        console.log("Parsed JSON Response:", result);

        if (response.ok) {
          setUploadSuccess(true);
          setAudioURL("");
          setSelectedIcon("book");
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          console.error("API Error:", result);
        }
      } catch (parseError) {
        console.error("JSON Parsing Error:", parseError);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const fetchAudio = async () => {
    try {
      const userToken = localStorage.getItem("auth_token");
      if (!userToken) {
        console.error("No user token found in local storage");
        return;
      }

      const response = await fetch(
        `https://kithia.com/website_b5d91c8e/api/audio/${bookId}/${pageNumber}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setAudioNotFoundMessage(""); // Clear any previous error message
        const audioUrl = result.audio_url;
        const audio = new Audio(audioUrl);
        setSelectedIcon("listen");
        setIsAudioPlaying(true);

        audio.play();
        audio.onended = () => {
          setIsAudioPlaying(false);
          setSelectedIcon("book");
        };
      } else {
        console.error("Audio not found:", result.error);
        if (result.error === "Audio not found") {
          setAudioNotFoundMessage(
            "No audio found! Record and upload an audio using the microphone icon."
          );
        }
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
    }
  };

  return (
    <div className="action-icons">
      <i
        className={`bi bi-book ${selectedIcon === "book" ? "green-icon" : ""}`}
        onClick={() => setSelectedIcon("book")}
        title="Read"
      ></i>

      <i
        className={`bi bi-mic ${selectedIcon === "mic" ? "green-icon" : ""}`}
        onClick={startRecording}
        title="Record"
      ></i>

      {isRecording && (
        <i
          className="bi bi-stop red-background"
          onClick={stopRecording}
          title="Stop"
        ></i>
      )}

      {audioURL && (
        <div className="playback-controls">
          <audio ref={audioRef} src={audioURL} controls />
          <button className="styled-button upload-btn" onClick={uploadAudio}>
            Upload
          </button>
          <button className="styled-button delete-btn" onClick={deleteAudio}>
            Delete
          </button>
        </div>
      )}

      <i
        className={`bi bi-headphones ${isAudioPlaying ? "green-icon" : ""}`}
        onClick={fetchAudio}
        title="Listen"
      ></i>

      {uploadSuccess && (
        <p className="upload-success-message">Upload Successful!</p>
      )}
      {audioNotFoundMessage && (
        <p className="audio-not-found-message">{audioNotFoundMessage}</p>
      )}
    </div>
  );
};

export default ActionIcons;
