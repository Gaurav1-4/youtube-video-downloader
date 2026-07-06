import { Download, Music, Video, Clock, User, HardDriveDownload, X, Info } from 'lucide-react';
import React, { useState } from 'react';

export default function VideoInfo({ videoData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownload = (url) => {
    // Silently track download usage
    fetch('/api/track', { method: 'POST' }).catch(() => {});
    
    // Because YouTube strictly blocks backend proxies with 403 Forbidden,
    // we must open the raw URL in a new tab using the user's IP.
    // To ensure good UX, we first show a modal explaining how to save it.
    setSelectedUrl(url);
    setModalOpen(true);
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '32px', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      
      {/* Top Section: Video Details */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ 
          flex: '1 1 300px',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          background: '#000',
          position: 'relative'
        }}>
          <img 
            src={videoData.thumbnail} 
            alt={videoData.title} 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {formatDuration(videoData.lengthSeconds)}
          </div>
        </div>
        
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.3' }}>
            {videoData.title}
          </h2>
          <div style={{ display: 'flex', gap: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={18} /> {videoData.author}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} /> {formatDuration(videoData.lengthSeconds)}
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

      {/* Bottom Section: Download Options */}
      <div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDriveDownload size={24} color="var(--accent-color)" /> Download Options
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Video Downloads */}
          {videoData.formats?.videoWithAudio?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '16px' }}>
                <Video size={20} /> Video + Audio (MP4)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {videoData.formats.videoWithAudio.map((format, idx) => (
                  <button
                    key={`vid-${idx}`}
                    onClick={() => handleDownload(format.url)}
                    className="download-btn video-btn"
                  >
                    <span style={{ fontWeight: 'bold' }}>{format.qualityLabel}</span>
                    <Download size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Downloads */}
          {videoData.formats?.audioOnly?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '16px' }}>
                <Music size={20} /> Audio Only
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {videoData.formats.audioOnly.map((format, idx) => (
                  <button
                    key={`aud-${idx}`}
                    onClick={() => handleDownload(format.url)}
                    className="download-btn audio-btn"
                  >
                    <span style={{ fontWeight: 'bold' }}>{format.qualityLabel} Quality</span>
                    <Download size={18} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!videoData.formats?.videoWithAudio?.length && !videoData.formats?.audioOnly?.length) && (
            <div style={{ color: 'rgba(255,255,255,0.5)', padding: '24px', textAlign: 'center', gridColumn: '1 / -1', background: 'rgba(255,0,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.2)' }}>
              Sorry, no direct download links are available for this specific video. Try a different video!
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '50%', color: '#60a5fa' }}>
                <Download size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Almost there!</h3>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, marginBottom: '16px', fontSize: '1.05rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>
                YouTube security blocks automated downloads. 
                Your video will open securely in a new player tab.
              </p>
              
              <ul style={{ margin: 0, paddingLeft: '24px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                <li><strong>PC / Android:</strong> Click the <strong>three dots (⋮)</strong> in the video player and select <strong>Download</strong>, or right-click to save.</li>
                <li><strong>iPhone / iPad:</strong> Long-press the <strong>Open Player</strong> button below and select <strong>Download Linked File</strong>. Or use the Safari Share icon.</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}
              >
                Cancel
              </button>
              <a 
                href={selectedUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', fontSize: '1.05rem', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Open Player
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Styles injected specifically for these buttons to maintain the premium feel while staying perfectly clean */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .download-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.05rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .download-btn:hover {
          transform: translateY(-2px);
        }
        .video-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8));
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .video-btn:hover {
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }
        .audio-btn {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8));
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .audio-btn:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
      `}} />
    </div>
  );
}
