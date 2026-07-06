import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'AnyDown | YouTube Video Downloader',
  description: 'A premium, fast, and secure tool to download YouTube videos directly to your device.',
};

const ALLOWED_EMAILS = [
  'gauravgoyal2112007@gmail.com',
  'studyonly.co@gmail.com',
  'carryoncrush@gmail.com',
  'tapsya998@gmail.com',
  'gaurav7015467655@gmail.com',
  'splicevoid@gmail.com',
  'gaurav25212@iiitd.ac.in'
];

export default async function RootLayout({ children }) {
  const user = await currentUser();
  
  // If user is logged in, check if their primary email is in the allowlist
  let isAllowed = false;
  if (user) {
    const email = user.primaryEmailAddress?.emailAddress;
    if (email && ALLOWED_EMAILS.includes(email)) {
      isAllowed = true;
    }
  } else {
    // If they are not logged in yet, middleware handles redirecting to sign-in.
    // We just let it render the sign in page.
    isAllowed = true; 
  }

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="background-wrapper">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
          </div>
          
          {!isAllowed ? (
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                <UserButton afterSignOutUrl="/" />
              </div>
              <div style={{ padding: '48px', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', borderRadius: '24px', marginTop: '100px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#ff6b6b' }}>Access Denied</h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                  Your email address ({user?.primaryEmailAddress?.emailAddress}) is not authorized to use this application.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Please click your profile picture in the top right to sign out and switch accounts.</p>
              </div>
            </main>
          ) : (
            children
          )}
        </ClerkProvider>
      </body>
    </html>
  );
}
