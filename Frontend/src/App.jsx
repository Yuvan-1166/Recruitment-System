import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './App.css';

const API_BASE = "http://127.0.0.1:8000"; // Adjust if needed

// Sign-Up
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/signup`, { name, email, password });
      alert(response.data.message);
      if (response.data.success) {
        navigate("/login");
      }
    } catch (error) {
      alert(error.response.data.detail || "Signup failed");
    }
  };

  return (
    <div className="container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required /><br></br>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br></br>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br></br>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

// Log-in
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/login`, { email, password });
      alert(response.data.message);
      if (response.data.success) {
        // Save token in local storage if needed:
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", email);
        navigate("/upload");
      }
    } catch (error) {
      alert(error.response.data.detail || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br></br>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br></br>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>
    </div>
  );
}

// Home
function Home(){
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
      // Instead of showing the raw extracted data and match score, we show a confirmation message.
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

function AdminDashboard() {
  const [resumes, setResumes] = useState([]);
  const [interviewDatetime, setInterviewDatetime] = useState(""); // common input for simplicity
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token"); // token from admin login
      const response = await axios.get(`${API_BASE}/admin/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(response.data.resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      alert("Error fetching resumes");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSchedule = async (candidateEmail) => {
    if (!interviewDatetime) {
      alert("Please enter interview date and time");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        candidate_email: candidateEmail,
        interview_datetime: interviewDatetime,
      };
      const response = await axios.post(`${API_BASE}/admin/schedule`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Error scheduling interview");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <h2>Uploaded Resumes</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Candidate Email</th>
            <th>Filename</th>
            <th>Match Score (%)</th>
            <th>Schedule Interview</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume, index) => (
            <tr key={index}>
              <td>{resume.email || "N/A"}</td>
              <td>{resume.filename}</td>
              <td>{(resume.match_score * 100).toFixed(2)}</td>
              <td>
                {resume.match_score >= 0.7 ? (
                  <div>
                    <input
                      type="datetime-local"
                      value={interviewDatetime}
                      onChange={(e) => setInterviewDatetime(e.target.value)}
                    />
                    <button onClick={() => handleSchedule(resume.email)}>
                      Schedule Interview
                    </button>
                  </div>
                ) : (
                  "Below threshold"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
