'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ShieldAlert, UserPlus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'gauravgoyal2112007@gmail.com';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL) {
      fetchEmails();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin/emails');
      if (!res.ok) throw new Error('Failed to fetch emails');
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(`${newEmail} has been granted access!`);
      setNewEmail('');
      fetchEmails();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveEmail = async (emailToRemove) => {
    if (emailToRemove === ADMIN_EMAIL) return;
    if (!confirm(`Are you sure you want to revoke access for ${emailToRemove}?`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToRemove })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(`${emailToRemove}'s access has been revoked.`);
      fetchEmails();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ff6b6b' }}>
        <ShieldAlert size={64} style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>403 - Forbidden</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }} className="animate-fade-in">
        <div style={{ background: '#10b981', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}>
          <ShieldCheck size={32} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-1px' }}>Security Admin</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage exactly who can access your application.</p>
        </div>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '32px', marginBottom: '32px', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={24} color="var(--accent-color)" /> Grant Access
        </h2>
        
        <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="email"
            placeholder="newuser@gmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="primary-btn">
            Add User
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', borderRadius: '8px', border: '1px solid rgba(255,0,0,0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
            {success}
          </div>
        )}
      </div>

      <div className="glass animate-fade-in" style={{ padding: '32px', animationDelay: '0.2s' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
          Authorized Users ({emails.length})
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {emails.map((email) => (
            <div key={email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '500' }}>{email}</span>
                {email === ADMIN_EMAIL && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    ADMIN
                  </span>
                )}
              </div>
              
              {email !== ADMIN_EMAIL && (
                <button 
                  onClick={() => handleRemoveEmail(email)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                  title="Revoke Access"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          
          {emails.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.4)' }}>
              No emails found in the database.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
