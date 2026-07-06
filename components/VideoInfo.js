import { Download, Video, Music, FileVideo } from 'lucide-react';
import React, { useState } from 'react';

export default function VideoInfo({ videoData, url }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (itag, title) => {
    setDownloading(true);
    // Create an invisible anchor tag to trigger the download download
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${itag}&title=${encodeURIComponent(title)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
      setDownloading(false);
    }, 2000); // Reset state after a short delay
  };

  const formatSeconds = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
      .filter(a => a)
      .join(':');
  };

  const renderFormatList = (formats, type, IconComponent) => {
    if (!formats || formats.length === 0) return null;

    return (
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '12px', color: 'rgba(255,255,255,0.9)' }}>
          <IconComponent size={20} color="var(--accent-color)" /> {type}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {formats.map((format, index) => (
            <button
              key={`${format.itag}-${index}`}
              onClick={() => handleDownload(format.itag, videoData.title)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{format.qualityLabel || 'Audio'}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>{format.container}</span>
              </div>
              {format.contentLength && (
                <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                  {(parseInt(format.contentLength) / (1024 * 1024)).toFixed(1)} MB
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <img 
            src={videoData.thumbnail} 
            alt={videoData.title} 
            style={{ 
              width: '100%', 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              objectFit: 'cover',
              aspectRatio: '16/9'
            }} 
          />
        </div>
        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', lineHeight: 1.2 }}>{videoData.title}</h2>
          <div style={{ display: 'flex', gap: '16px', opacity: 0.7, marginBottom: '16px', fontSize: '0.95rem' }}>
            <span>{videoData.author}</span>
            <span>•</span>
            <span>{formatSeconds(videoData.lengthSeconds)}</span>
          </div>
          {downloading && (
            <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,0,80,0.1)', borderRadius: '8px' }}>
              <Download size={16} className="animate-pulse" />
              Download started! (Check your browser downloads)
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
        {renderFormatList(videoData.formats.videoWithAudio, 'Video + Audio (Ready to play)', Video)}
        {renderFormatList(videoData.formats.videoOnly, 'Video Only (High Quality, No Sound)', FileVideo)}
        {renderFormatList(videoData.formats.audioOnly, 'Audio Only (Music/Podcasts)', Music)}
      </div>
    </div>
  );
}
