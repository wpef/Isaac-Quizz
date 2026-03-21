import React from 'react';

export default function Feedback({ correct, explanation, onNext }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      border: `2px solid ${correct ? '#0f0' : '#f00'}`,
      borderRadius: 8,
      padding: '16px 24px',
      maxWidth: 500,
      textAlign: 'center',
      zIndex: 10,
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{
        fontSize: 14,
        marginBottom: 10,
        color: correct ? '#0f0' : '#f00',
      }}>
        {correct ? 'CORRECT!' : 'WRONG!'}
      </div>

      <div style={{
        fontSize: 8,
        lineHeight: 1.6,
        color: '#ccc',
        marginBottom: 16,
      }}>
        {explanation}
      </div>

      <button
        onClick={onNext}
        style={{
          fontFamily: "'Press Start 2P', cursive",
          fontSize: 10,
          padding: '10px 24px',
          background: 'none',
          border: '2px solid #e0d5c0',
          color: '#e0d5c0',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#e0d5c0';
          e.target.style.color = '#111';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'none';
          e.target.style.color = '#e0d5c0';
        }}
      >
        NEXT ROOM &gt;
      </button>
    </div>
  );
}
