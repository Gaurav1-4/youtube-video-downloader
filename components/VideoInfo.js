import { Download } from 'lucide-react';
import React, { useState } from 'react';

export default function VideoInfo({ videoData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadThumbnail = async () => {
    setDownloading(true);
    try {
      // Fetch the image to trigger a direct download rather than opening in new tab
      const response = await fetch(videoData.thumbnail);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'youtube_thumbnail.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed, opening in new tab', e);
      window.open(videoData.thumbnail, '_blank');
    }
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '24px', marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        background: '#000'
      }}>
        <img 
          src={videoData.thumbnail} 
          alt="Video Thumbnail" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>
      
      <button
        onClick={handleDownloadThumbnail}
        style={{
          background: 'var(--accent-color)',
          border: 'none',
          color: '#fff',
          padding: '12px 32px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 12px rgba(255, 0, 80, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Download size={20} />
        {downloading ? 'Downloading...' : 'Download Thumbnail'}
      </button>
    </div>
  );
}
