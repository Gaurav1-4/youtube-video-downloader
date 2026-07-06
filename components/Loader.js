export default function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
      <style>
        {`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 0, 80, 0.2);
            border-left-color: var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="spinner"></div>
    </div>
  );
}
