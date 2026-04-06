import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// --- Import your Components ---
// Ensure these paths match your folder structure exactly
import Submit from './components/Submit'; 
import FacultyDashboard from './pages/FacultyDashboard';

// --- A Simple Home Component (Optional) ---
const Home = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h1>CH.E. Secure Exam Engine 🚀</h1>
    <p>Select your portal below:</p>
    <div style={{ marginTop: '20px' }}>
      <Link to="/submit" style={buttonStyle}>Student Portal (Take Exam)</Link>
      <Link to="/dashboard" style={{ ...buttonStyle, backgroundColor: '#007bff' }}>Faculty Portal (Evaluation)</Link>
    </div>
  </div>
);

const buttonStyle = {
  display: 'inline-block',
  padding: '12px 24px',
  margin: '10px',
  backgroundColor: '#28a745',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};

function App() {
  return (
    <Router>
      {/* Navigation Header visible on all pages */}
      <nav style={{ 
        padding: '15px', 
        backgroundColor: '#333', 
        color: 'white', 
        display: 'flex', 
        gap: '20px',
        fontFamily: 'sans-serif' 
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/submit" style={{ color: 'white', textDecoration: 'none' }}>Submit Exam</Link>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
      </nav>

      <Routes>
        {/* Route for the Welcome Home Page */}
        <Route path="/" element={<Home />} />

        {/* Route for the Student Submission Page */}
        <Route path="/submit" element={<Submit />} />

        {/* Route for the Faculty Dashboard */}
        <Route path="/dashboard" element={<FacultyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;