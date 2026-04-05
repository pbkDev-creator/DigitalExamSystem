import React, { useState } from 'react';

// --- UPDATE THIS WITH YOUR ACTUAL RENDER URL ---
const API_BASE = "https://digitalexamsystem.onrender.com"; 

const Submit = () => {
  const [studentId, setStudentId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !studentId) {
      alert("Please enter Student ID and select a photo of your answer script.");
      return;
    }

    setUploading(true);
    setMessage("Uploading to Cloudinary...");

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('answer_image', file); // Matches upload.single('answer_image') in index.js

    try {
      const response = await fetch(`${API_BASE}/api/upload-answer`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Submission Successful! Image stored in Cloud.");
        console.log("Cloudinary URL:", data.imageUrl);
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setMessage("🚨 Server Error. Ensure your Render service is awake.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Student Exam Submission</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Student ID/Roll No:</label>
          <input 
            type="text" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
            placeholder="e.g. CHE-2026-001"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Capture Answer Script:</label>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFileChange}
            style={{ width: '100%', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={uploading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: uploading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {uploading ? "Processing..." : "Submit Answer Script"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Submit;