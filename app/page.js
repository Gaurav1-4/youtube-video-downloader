'use client';

import { useState } from 'react';
import { Search, Download, AlertCircle } from 'lucide-react';
import VideoInfo from '../components/VideoInfo';
import Loader from '../components/Loader';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch video information');
      }

      setVideoData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <UserButton afterSignOutUrl="/" />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--accent-color)', padding: '12px', borderRadius: '16px', display: 'flex', boxShadow: '0 8px 32px rgba(255,0,80,0.4)' }}>
            <Download size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', letterSpacing: '-1px' }}>AnyDown</h1>
        </div>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
          Download YouTube videos in high quality. Fast, free, and secure.
        </p>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '8px', animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: '1' }}>
            <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Paste YouTube link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '52px' }}
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading || !url.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading && <Loader />}

      {error && (
        <div className="animate-fade-in" style={{ 
          marginTop: '24px', 
          padding: '16px 24px', 
          background: 'rgba(255, 0, 0, 0.1)', 
          border: '1px solid rgba(255, 0, 0, 0.2)', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#ff6b6b'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {videoData && (
        <VideoInfo videoData={videoData} url={url} />
      )}
    </main>
  );
}
