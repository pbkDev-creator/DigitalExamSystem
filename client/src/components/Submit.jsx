import React, { useState } from 'react';

const Submit = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setStatus(''); // Clear any previous errors
    }
  };

  const handleUpload = async () => {
    if (!file || !studentId) {
      alert("Please enter Student Roll Number and capture your answer sheet.");
      return;
    }

    setLoading(true);
    setStatus('⌛ Processing Upload...');

    const formData = new FormData();
    formData.append('answer_image', file);
    formData.append('studentId', studentId);

    try {
      /**
       * DYNAMIC IP DETECTION
       * This detects the IP address of your laptop from the URL 
       * (e.g., http://192.168.1.5:5174/submit) so the phone 
       * sends the image to the correct destination.
       */
      const serverIP = window.location.hostname; 
      
      const response = await fetch(`http://192.168.68.101:5000/api/upload-answer`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('✅ SUBMISSION SUCCESSFUL!');
        setPreview(null);
        setFile(null);
        setStudentId(''); // Reset for next submission if needed
      } else {
        setStatus(`❌ Upload failed: ${data.message || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setStatus('❌ Server Connection Error. Ensure you are on the same Wi-Fi as the Faculty laptop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6 items-center justify-center font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <header className="text-center mb-8">
          <div className="inline-block bg-blue-600/20 text-blue-400 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Student Portal</h1>
          <p className="text-slate-500 text-[10px] font-mono mt-1 tracking-widest uppercase italic">Secure Submission Link</p>
        </header>

        <div className="space-y-6">
          {/* ROLL NUMBER INPUT */}
          <div>
            <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-2">Student Roll Number</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white font-bold transition-all"
              placeholder="e.g. CHE-2026-001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          {/* CAMERA / CAPTURE AREA */}
          <div className="relative border-2 border-dashed border-slate-800 rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center bg-slate-950 group hover:border-blue-500 transition-all">
            {preview ? (
              <img src={preview} alt="Answer Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-tighter">Tap to open Camera</p>
                <p className="text-slate-700 text-[9px] mt-2 italic">Capture your handwritten answer sheet clearly</p>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            onClick={handleUpload}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40 active:scale-95'
            }`}
          >
            {loading ? 'Processing...' : 'Submit Answer Sheet'}
          </button>

          {/* STATUS MESSAGE */}
          {status && (
            <div className={`mt-4 p-4 rounded-xl text-center text-xs font-bold border animate-pulse ${
              status.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-slate-800 text-[9px] uppercase font-mono tracking-widest">
        Design optimized for Ch.E. Internal Exams v1.0
      </footer>
    </div>
  );
};

export default Submit;