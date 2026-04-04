import React, { useState } from 'react';
import { Camera, UploadCloud, CheckCircle } from 'lucide-react';

const MobileUpload = () => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const uploadToCloud = async () => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append('answer_image', image);

    try {
      const response = await fetch('http://localhost:5000/api/upload-answer', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) setStatus('success');
    } catch (err) {
      alert("Upload failed. Check server connection.");
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-green-50 text-center">
        <CheckCircle size={80} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-green-800">Submission Received!</h1>
        <p className="text-green-600 mt-2">You can close this tab and continue your exam.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
        <h2 className="text-xl font-bold mb-2">Answer Scanner</h2>
        <p className="text-slate-400 text-sm mb-8">Snap a clear photo of your handwritten calculations.</p>

        {image ? (
          <div className="relative mb-6">
            <img src={URL.createObjectURL(image)} className="rounded-xl w-full h-64 object-cover border-2 border-blue-500" alt="Preview" />
            <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full">X</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:bg-slate-700/50 transition-all mb-6">
            <Camera size={48} className="text-slate-500 mb-2" />
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Open Camera</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          </label>
        )}

        <button 
          onClick={uploadToCloud}
          disabled={!image || status === 'uploading'}
          className="w-full py-4 bg-blue-600 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {status === 'uploading' ? "UPLOADING..." : <><UploadCloud size={20} /> SUBMIT ANSWER</>}
        </button>
      </div>
    </div>
  );
};

export default MobileUpload;