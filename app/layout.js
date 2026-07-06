import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: 'AnyDown | YouTube Video Downloader',
  description: 'A premium, fast, and secure tool to download YouTube videos directly to your device.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <div className="background-wrapper">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
          </div>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
