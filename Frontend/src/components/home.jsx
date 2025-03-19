import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function Home() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a PDF file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(
        "Your resume has been successfully processed. We will contact you if your profile matches our requirements."
      );
      setResponse(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/send-email", {
        candidate_email: "candidate@example.com",
      });
      setEmailSent(true);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="container">
      <h1>Faculty Recruitment System</h1>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Uploading..." : "Upload & Process Resume"}
        </button>
      </form>
      {uploadStatus && (
        <div style={{ marginTop: "2rem" }}>
          <p>{uploadStatus}</p>
        </div>
      )}
      {response && (
        <div>
          <h3>Extracted Details</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(response.resume_text, null, 2)}</pre>
          <h2>Match Score</h2>
          <progress value={response.match_score} max="1"></progress> <h3>{Math.round(response.match_score * 100) + "%"}</h3>
        </div>
      )}

      {response?.match_score > 0.6 && (
        <h2>Email Sent Successfully</h2>
      )}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          navigate("/login");
        }}
        style={{ marginTop: "2rem" }} className='logout-btn'
      >
        Logout
      </button>
    </div>
    
  );
}

export default Home;
