'use client';

import { useState } from 'react';
import { Search, Download, AlertCircle } from 'lucide-react';
import VideoInfo from '../components/VideoInfo';
import Loader from '../components/Loader';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { SparklesCore } from '../components/ui/sparkles';

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
      <header style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '32px', zIndex: 50 }}>
        <Link href="/admin" className="hover:text-white" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
          Admin Dashboard
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '48px',
        position: 'relative'
      }} className="animate-fade-in">
        
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
            <div className="logo-icon-container" style={{ background: 'var(--accent-color)', padding: '14px', borderRadius: '18px', display: 'flex', boxShadow: '0 8px 32px rgba(255,0,80,0.5)' }}>
              <Download className="logo-icon" size={36} color="white" />
            </div>
            <h1 className="brand-title" style={{ fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-2px', color: '#fff', margin: 0 }}>ZoraYT</h1>
          </div>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '24px auto 0', textAlign: 'center', zIndex: 10 }}>
            Download YouTube videos in high quality. Fast, free, and secure.
          </p>
        </div>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '8px', animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} className="search-form" style={{ display: 'flex', gap: '8px' }}>
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

      {/* Sparkles Core & Glowing Line moved below the search bar */}
      <div className="sparkles-container" style={{ width: '40rem', height: '200px', position: 'relative', margin: '0 auto', zIndex: 0 }}>
        {/* Gradients */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '75%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,0,80,0.8), transparent)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '75%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,0,80,0.8), transparent)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '25%', height: '5px', background: 'linear-gradient(90deg, transparent, rgba(255,0,80,1), transparent)', filter: 'blur(4px)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '25%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,0,80,1), transparent)' }} />

        {/* Core component */}
        <div style={{ 
          position: 'absolute', 
          top: '2px', 
          left: 0, 
          width: '100%', 
          height: '100%', 
          WebkitMaskImage: 'radial-gradient(circle at top center, black 0%, transparent 70%)', 
          maskImage: 'radial-gradient(circle at top center, black 0%, transparent 70%)' 
        }}>
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1.5}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
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
