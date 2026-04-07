import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- 1. MASTER LICENSE DATABASE ---
const VALID_LICENSES = [
  {
  "key": "TRIAL-SXAD-3Z6V",
  "owner": "Dr. SATISH H",
  "expiry": "2026-04-10"
},
  { key: "FAC-CHEM-2026-X1", owner: "Dr. Smith", expiry: "2026-12-31" },
  { key: "FAC-POLY-2026-A2", owner: "Prof. Jones", expiry: "2026-06-01" },
  { key: "TRIAL-99", owner: "Guest User", expiry: "2026-05-10" },
  { key: "ADMIN-MASTER", owner: "System Administrator", expiry: "2030-01-01" }
];

const SUBJECTS = [
  "MOMENTUM TRANSFER", "PARTICULATE TECHNOLOGY", "MATERIAL AND ENERGY BALANCE",
  "CHEMICAL PROCESS INDUSTRIES", "INDUSTRIAL POLLUTION CONTROL", "PROCESS HEAT TRANSFER",
  "CH.E. THERMODYNAMICS", "MASS TRANSFER - I", "MASS TRANSFER - II",
  "CHEMICAL REACTION ENGINEERING - I", "PROCESS CONTROL & IIOT"
];

// --- 2. LOGIN VIEW ---
const LoginView = ({ onLoginSuccess }) => {
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");

  const handleAuth = (e) => {
    e.preventDefault();
    const license = VALID_LICENSES.find(l => l.key === inputKey);
    if (!license) {
      setError("Invalid License Key. Access Denied.");
    } else {
      const isExpired = new Date() > new Date(license.expiry);
      if (isExpired) {
        setError(`License expired on ${license.expiry}.`);
      } else {
        localStorage.setItem("faculty_session", JSON.stringify(license));
        onLoginSuccess(license);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] max-w-md w-full shadow-2xl text-center border-t-4 border-t-blue-600">
        <h1 className="text-3xl font-black text-white italic mb-2 tracking-tighter">CH.E. SECURE_EXAM PRO</h1>
        <p className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-8">Faculty Authentication</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter License Key" 
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center text-white outline-none focus:border-blue-500 transition-all font-mono tracking-widest"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
          />
          {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg">Verify License</button>
        </form>
      </div>
    </div>
  );
};

// --- 3. MAIN DASHBOARD ---
const FacultyDashboard = () => {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('design');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [syllabusFocus, setSyllabusFocus] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  const [examData, setExamData] = useState([
    { id: 1, title: "Main Question 1", subQs: [{ id: '1a', text: '', marks: 5, ans: '', type: 'Numerical' }] },
    { id: 2, title: "Main Question 2", subQs: [{ id: '2a', text: '', marks: 5, ans: '', type: 'Theory' }] },
    { id: 3, title: "Main Question 3", subQs: [{ id: '3a', text: '', marks: 5, ans: '', type: 'Derivation' }] },
  ]);

  const [submissions, setSubmissions] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);

  // --- CONFIG: CHANGE THIS TO YOUR ACTUAL VERCEL URL ---
  const VERCEL_URL = "digital-exam-system-self.vercel.app"; 
  const RENDER_URL = "https://digitalexamsystem.onrender.com";

  useEffect(() => {
    const session = localStorage.getItem("faculty_session");
    if (session) {
      const parsed = JSON.parse(session);
      if (new Date() < new Date(parsed.expiry)) setAuth(parsed);
      else localStorage.removeItem("faculty_session");
    }
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${RENDER_URL}/api/submissions`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev => {
          const lockedData = JSON.parse(localStorage.getItem('locked_submissions') || "[]");
          const deletedIds = JSON.parse(localStorage.getItem('deleted_ids') || "[]");
          const lockedMap = new Map(lockedData.map(s => [s.studentId, s]));
          return data.data
            .filter(s => !deletedIds.includes(s.studentId))
            .map(incoming => lockedMap.get(incoming.studentId) || incoming);
        });
      }
    } catch (e) { console.log("Backend offline..."); }
  };

  useEffect(() => {
    if (auth) {
      fetchSubmissions();
      const interval = setInterval(fetchSubmissions, 4000); 
      return () => clearInterval(interval);
    }
  }, [auth]);

  const handleLogout = () => { localStorage.removeItem("faculty_session"); setAuth(null); };

  const deleteStudent = (rollNo) => {
    if (window.confirm(`Delete ${rollNo}?`)) {
      const deletedIds = JSON.parse(localStorage.getItem('deleted_ids') || "[]");
      localStorage.setItem('deleted_ids', JSON.stringify([...new Set([...deletedIds, rollNo])]));
      setSubmissions(prev => prev.filter(s => s.studentId !== rollNo));
      if (selectedSub?.studentId === rollNo) setSelectedSub(null);
    }
  };

  const handleLockGrades = () => {
    if (!selectedSub) return;
    const updatedSubmissions = submissions.map(st => 
      st.studentId === selectedSub.studentId ? { ...selectedSub } : st
    );
    setSubmissions(updatedSubmissions);
    const currentLocked = JSON.parse(localStorage.getItem('locked_submissions') || "[]");
    const updatedLocked = [...currentLocked.filter(l => l.studentId !== selectedSub.studentId), selectedSub];
    localStorage.setItem('locked_submissions', JSON.stringify(updatedLocked));
    alert(`Grades for ${selectedSub.studentId} locked and synced to Analytics.`);
  };

  const handleAI = async (qId, subId, marks, type) => {
    try {
      const res = await fetch(`${RENDER_URL}/api/generate-sub-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, syllabusContext: syllabusFocus, type, marks })
      });
      const data = await res.json();
      if (data.success) {
        setExamData(prev => prev.map(q => q.id === qId ? { ...q, subQs: q.subQs.map(s => s.id === subId ? { ...s, text: data.text, ans: data.answer_key } : s) } : q));
      }
    } catch (e) { alert("AI Service Busy."); }
  };

  const handleScoreChange = (qid, val) => {
    if (!selectedSub) return;
    const num = val === "" ? 0 : parseFloat(val);
    const newMarks = { ...selectedSub.marks, [qid]: num };
    const getSum = (p) => Object.keys(newMarks).filter(k => k.startsWith(p)).reduce((a, b) => a + (parseFloat(newMarks[b]) || 0), 0);
    const sorted = [getSum('1'), getSum('2'), getSum('3')].sort((a, b) => b - a);
    setSelectedSub({ ...selectedSub, marks: newMarks, totalScore: Number(sorted[0] || 0) + Number(sorted[1] || 0) });
  };

  const downloadCSV = () => {
    const headers = "Roll Number,Total Score\n";
    const rows = submissions.map(s => `${s.studentId},${s.totalScore || 0}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "Grading_Report.csv"; a.click();
  };

  if (!auth) return <LoginView onLoginSuccess={setAuth} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <style>{`
        @media print {
          .print-hide, nav, button, select, textarea, .sidebar-inbox { display: none !important; }
          body { background: white !important; color: black !important; padding: 30px !important; }
          .question-box { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px !important; page-break-inside: avoid !important; }
          .q-text-print { display: block !important; color: black !important; white-space: pre-wrap; font-family: serif; }
          .marks-print { display: block !important; float: right !important; font-weight: bold; }
          .header-print { display: block !important; text-align: center; margin-bottom: 30px; border-bottom: 2px solid black; padding-bottom: 10px; }
        }
        @media screen { .q-text-print, .header-print, .marks-print { display: none; } }
      `}</style>

      {/* NAVIGATION */}
      <nav className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6 print-hide">
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('design')} className={`px-6 py-2 rounded-full font-bold text-xs uppercase ${view === 'design' ? 'bg-blue-600' : 'bg-slate-900'}`}>Design</button>
          <button onClick={() => setView('evaluate')} className={`px-6 py-2 rounded-full font-bold text-xs uppercase ${view === 'evaluate' ? 'bg-blue-600' : 'bg-slate-900'}`}>Evaluate</button>
          <button onClick={() => setView('analytics')} className={`px-6 py-2 rounded-full font-bold text-xs uppercase ${view === 'analytics' ? 'bg-indigo-600' : 'bg-slate-900'}`}>Analytics</button>
          <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
          <button onClick={handleLogout} className="px-4 py-2 rounded-full font-bold text-[9px] uppercase bg-slate-900 text-red-500 border border-red-900/30 hover:bg-red-600 hover:text-white transition-all">Logout</button>
        </div>
        <div className="text-right">
            <h1 className="text-xl font-black italic text-blue-500 tracking-tighter">CH.E. SECURE_EXAM</h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Faculty: {auth.owner}</p>
        </div>
      </nav>

      {/* DESIGN VIEW */}
      {view === 'design' && (
        <div className="space-y-8 animate-in fade-in">
          <header className="flex justify-between items-start print-hide">
            <div className="flex-1 space-y-4">
              <select className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm w-80 text-white outline-none" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
              <textarea className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm italic block" placeholder="AI Keywords..." value={syllabusFocus} onChange={(e) => setSyllabusFocus(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowQR(true)} className="bg-blue-600 px-6 py-2 rounded-lg font-bold text-xs uppercase">📲 QR Access</button>
              <button onClick={() => window.print()} className="bg-slate-800 px-6 py-2 rounded-lg font-bold text-xs uppercase">Print Paper</button>
            </div>
          </header>

          <div className="header-print">
            <h1 className="text-2xl font-bold uppercase">{selectedSubject}</h1>
            <p>Final Examination | Max Marks: 40</p>
          </div>

          {examData.map((mainQ) => (
            <div key={mainQ.id} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 mb-6 question-box">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3 print-hide">
                <h2 className="font-black uppercase text-lg text-white">{mainQ.title}</h2>
                <button onClick={() => setExamData(prev => prev.map(q => q.id === mainQ.id ? {...q, subQs: [...q.subQs, {id: `${mainQ.id}${String.fromCharCode(97+q.subQs.length)}`, text: '', marks: 5, ans: '', type: 'Numerical'}]} : q))} className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full">+ Add Sub-Q</button>
              </div>
              <h2 className="header-print text-left border-none mb-4">{mainQ.title}</h2>
              {mainQ.subQs.map((sub) => (
                <div key={sub.id} className="grid grid-cols-12 gap-4 mb-8 items-start">
                  <div className="col-span-1 text-blue-500 font-black text-xl print:text-black">{sub.id}</div>
                  <div className="col-span-7">
                    <textarea className="print-hide w-full bg-transparent border-none outline-none text-base text-white h-auto min-h-[40px] resize-none" value={sub.text} onChange={(e) => setExamData(prev => prev.map(q => q.id === mainQ.id ? {...q, subQs: q.subQs.map(s => s.id === sub.id ? {...s, text: e.target.value} : s)} : q))} />
                    <p className="q-text-print">{sub.text}</p>
                    {sub.ans && <div className="print-hide mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-slate-400 italic">Key: {sub.ans}</div>}
                  </div>
                  <div className="col-span-4 flex flex-col items-end gap-2 print-hide">
                    <div className="flex gap-2">
                      <select className="bg-slate-900 border border-slate-700 text-[10px] p-2 rounded text-slate-300" value={sub.type} onChange={(e) => setExamData(prev => prev.map(q => q.id === mainQ.id ? {...q, subQs: q.subQs.map(s => s.id === sub.id ? {...s, type: e.target.value} : s)} : q))}>
                        <option>Numerical</option><option>Theory</option><option>Derivation</option><option>Short Definition</option>
                      </select>
                      <input type="number" className="w-14 bg-slate-900 border border-slate-700 p-2 rounded text-center text-blue-400 font-bold" value={sub.marks} onChange={(e) => setExamData(prev => prev.map(q => q.id === mainQ.id ? {...q, subQs: q.subQs.map(s => s.id === sub.id ? {...s, marks: parseInt(e.target.value)} : s)} : q))} />
                      <button onClick={() => setExamData(prev => prev.map(q => q.id === mainQ.id ? {...q, subQs: q.subQs.filter(s => s.id !== sub.id)} : q))} className="text-red-500 text-sm">🗑️</button>
                    </div>
                    <button onClick={() => handleAI(mainQ.id, sub.id, sub.marks, sub.type)} className="w-full bg-blue-600 text-[10px] py-2 rounded font-black uppercase tracking-widest shadow-lg">✨ AI Generate</button>
                  </div>
                  <div className="marks-print">[{sub.marks} M]</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* EVALUATE VIEW */}
      {view === 'evaluate' && (
        <div className="grid grid-cols-12 gap-6 h-[80vh] animate-in fade-in">
          <div className="col-span-3 space-y-2 overflow-y-auto pr-2 sidebar-inbox">
            <h3 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Grading Inbox</h3>
            {submissions.map((s, idx) => (
              <div key={s.studentId + idx} className="flex gap-1 group">
                <button onClick={() => setSelectedSub(s)} className={`flex-1 text-left p-4 rounded-xl border transition ${selectedSub?.studentId === s.studentId ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900'}`}>
                  <p className="font-bold text-white text-xs uppercase">{s.studentId}</p>
                  <p className="text-[9px] text-blue-400">Score: {s.totalScore || 0}/40</p>
                </button>
                <button onClick={() => deleteStudent(s.studentId)} className="bg-red-950/20 text-red-500 px-3 rounded-xl border border-red-900/30 hover:bg-red-600 hover:text-white transition opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            ))}
            <button onClick={downloadCSV} className="w-full mt-4 bg-emerald-600 text-[10px] font-bold py-4 rounded-xl uppercase hover:bg-emerald-500 transition shadow-lg">📥 Download CSV Report</button>
          </div>
          <div className="col-span-9 bg-slate-900 rounded-3xl p-6 border border-slate-800 overflow-hidden">
            {selectedSub ? (
              <div className="grid grid-cols-2 gap-6 h-full">
                <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center"><img src={selectedSub.imageUrl} className="max-w-full max-h-full object-contain" alt="Script" /></div>
                <div className="overflow-y-auto pr-2 space-y-4">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center sticky top-0 z-20">
                    <p className="text-xl font-black">{selectedSub.studentId}</p>
                    <p className="text-4xl font-black text-blue-500">{selectedSub.totalScore || 0}</p>
                  </div>
                  {examData.map(q => q.subQs.map(sub => (
                    <div key={sub.id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-blue-400 uppercase">Q {sub.id} ({sub.marks}M)</span>
                        <input type="number" step="0.5" className="bg-slate-900 text-white font-black w-20 p-2 rounded-lg text-center border border-blue-500/50" value={selectedSub.marks[sub.id] || ""} onChange={(e) => handleScoreChange(sub.id, e.target.value)} />
                      </div>
                      <div className="bg-black/30 p-2 rounded border border-slate-800 text-[10px] text-slate-400 italic">Key: {sub.ans || "N/A"}</div>
                    </div>
                  )))}
                  <button onClick={handleLockGrades} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-blue-500 transition-all active:scale-95">🔒 Record & Lock Grades</button>
                </div>
              </div>
            ) : <div className="flex h-full items-center justify-center text-slate-700 italic">Select a Roll Number</div>}
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-black uppercase tracking-tighter">Performance Dashboard</h2>
             <button onClick={() => window.print()} className="bg-indigo-600 px-6 py-2 rounded-lg font-bold text-xs uppercase">Download PDF Report</button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Submissions</p><p className="text-4xl font-black text-white">{submissions.length}</p></div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Average</p><p className="text-4xl font-black text-blue-500">{(submissions.reduce((a,b)=>a+(Number(b.totalScore)||0),0)/(submissions.length||1)).toFixed(1)}</p></div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pass Rate</p><p className="text-4xl font-black text-emerald-500">{submissions.length ? ((submissions.filter(s=>Number(s.totalScore)>=16).length/submissions.length)*100).toFixed(0) : 0}%</p></div>
          </div>
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800" style={{ minHeight: '400px' }}>
             <ResponsiveContainer width="100%" height={400} key={view}>
                <BarChart data={submissions.filter(s => (Number(s.totalScore) || 0) > 0)}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} /><XAxis dataKey="studentId" stroke="#64748b" fontSize={10} /><YAxis stroke="#64748b" /><Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px'}} /><Bar dataKey="totalScore" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={40} /></BarChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center pt-6"><button onClick={() => {localStorage.clear(); window.location.reload();}} className="bg-red-950/30 text-red-500 border border-red-900/50 px-8 py-3 rounded-full font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">⚠️ Clear Data & Reset</button></div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 text-center max-w-sm w-full shadow-2xl">
            {/* --- UPDATED: QR CODE NOW POINTS TO VERCEL URL --- */}
            <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-2xl shadow-blue-500/20">
              <QRCodeCanvas value={`https://${VERCEL_URL}/submit?subject=${selectedSubject}`} size={200} />
            </div>
            <div className="mb-6">
              <p className="text-[10px] text-blue-500 font-bold uppercase mb-2">Live Exam Portal</p>
              <p className="text-white text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                {VERCEL_URL}/submit
              </p>
            </div>
            <button onClick={() => setShowQR(false)} className="w-full bg-slate-800 py-3 rounded-2xl font-bold uppercase text-[10px]">Close Portal</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;