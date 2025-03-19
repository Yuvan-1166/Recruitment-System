import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './App.css';

const API_BASE = "http://127.0.0.1:8000";

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

export default AdminDashboard();
