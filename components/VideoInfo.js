import { Download, Video, Music, Clock } from 'lucide-react';
import React, { useState } from 'react';

export default function VideoInfo({ videoData, url }) {
  const [downloading, setDownloading] = useState(false);

  const getVideoId = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube.com')) {
        return parsed.searchParams.get('v');
      }
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1);
      }
    } catch (e) {
      return null;
    }
    return null;
  };
  
  const videoId = getVideoId(url);

  const handleDownload = (itag, title) => {
    setDownloading(true);
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${itag}&title=${encodeURIComponent(title)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  const formatSeconds = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
      .filter(a => a)
      .join(':');
  };

  const renderFormatList = (formats, type, IconComponent, badgeText) => {
    if (!formats || formats.length === 0) return null;

    return (
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', margin: 0, background: 'rgba(0,0,0,0.2)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <IconComponent size={20} color={badgeText === 'MP4' ? '#10b981' : '#10b981'} /> {type}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none' }}>
          {formats.map((format, index) => (
            <div
              key={`${format.itag}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: index < formats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                <span style={{ 
                  background: '#f59e0b', 
                  color: '#fff', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}>
                  {badgeText}
                </span>
                <span style={{ fontWeight: '600', fontSize: '1rem', minWidth: '80px' }}>
                  {format.qualityLabel || 'Audio'}
                </span>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  {format.contentLength ? `${(parseInt(format.contentLength) / (1024 * 1024)).toFixed(2)} MB` : 'Size Unknown'}
                </span>
              </div>
              
              <button
                onClick={() => handleDownload(format.itag, videoData.title)}
                style={{
                  background: 'transparent',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#10b981';
                }}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass animate-fade-in" style={{ padding: '24px', marginTop: '32px' }}>
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Video & Info */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            width: '100%', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            aspectRatio: '16/9',
            background: '#000'
          }}>
            {videoId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={videoData.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <img 
                src={videoData.thumbnail} 
                alt={videoData.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}
          </div>
          
          <h2 style={{ fontSize: '1.4rem', lineHeight: 1.3, fontWeight: '600' }}>
            {videoData.title}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#4ade80', 
              color: '#064e3b', 
              padding: '6px 12px', 
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '700'
            }}>
              <Clock size={16} /> {formatSeconds(videoData.lengthSeconds)}
            </span>
            <span style={{ opacity: 0.7, fontSize: '0.95rem' }}>
              {videoData.author}
            </span>
          </div>

          {downloading && (
            <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(255,0,80,0.1)', borderRadius: '8px', marginTop: '16px' }}>
              <Download size={16} className="animate-pulse" />
              Download started! (Check your browser downloads)
            </div>
          )}
        </div>

        {/* Right Column: Download Formats */}
        <div style={{ flex: '2 1 400px' }}>
          {renderFormatList([...(videoData.formats.videoWithAudio || []), ...(videoData.formats.videoOnly || [])], 'Video', Video, 'MP4')}
          {renderFormatList(videoData.formats.audioOnly, 'Music', Music, 'MP3')}
        </div>
        
      </div>
    </div>
  );
}
