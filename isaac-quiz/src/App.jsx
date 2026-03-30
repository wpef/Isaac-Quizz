import React, { useState, useCallback } from 'react';
import Room from './components/Room';
import Pedestal from './components/Pedestal';
import Hearts from './components/Hearts';
import Feedback from './components/Feedback';

const DIFFICULTIES = ['normal', 'hard', 'expert'];

export default function App() {
  const [difficulty, setDifficulty] = useState('normal');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hp, setHp] = useState(6);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const fetchQuestion = useCallback(async (diff) => {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/question?diff=${diff || difficulty}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  const handleAnswer = (itemId) => {
    if (selected !== null) return;
    setSelected(itemId);
    if (itemId === question.correct_id) {
      setScore((s) => s + (streak + 1) * 100);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
      setHp((h) => {
        const next = h - 1;
        if (next <= 0) setGameOver(true);
        return Math.max(0, next);
      });
    }
  };

  const handleNext = () => {
    fetchQuestion();
  };

  const handleRestart = () => {
    setHp(6);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setQuestion(null);
    setSelected(null);
  };

  // Title screen
  if (!question && !loading && !error) {
    return (
      <Room>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}>
          <h1 style={{ fontSize: 20, color: '#e0d5c0', textShadow: '2px 2px #000' }}>
            ISAAC QUIZ
          </h1>
          <p style={{ fontSize: 8, color: '#888' }}>
            Test your Binding of Isaac knowledge
          </p>

          {/* Difficulty selector */}
          <div style={{ display: 'flex', gap: 12 }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: 8,
                  padding: '8px 16px',
                  background: d === difficulty ? '#e0d5c0' : 'none',
                  color: d === difficulty ? '#111' : '#888',
                  border: `2px solid ${d === difficulty ? '#e0d5c0' : '#444'}`,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchQuestion()}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: 12,
              padding: '14px 32px',
              background: 'none',
              border: '3px solid #e0d5c0',
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
            START
          </button>
        </div>
      </Room>
    );
  }

  // Game over
  if (gameOver) {
    return (
      <Room>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}>
          <h1 style={{ fontSize: 16, color: '#f00' }}>GAME OVER</h1>
          <p style={{ fontSize: 10 }}>FINAL SCORE: {score}</p>
          <button
            onClick={handleRestart}
            style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: 10,
              padding: '12px 28px',
              background: 'none',
              border: '2px solid #e0d5c0',
              color: '#e0d5c0',
              cursor: 'pointer',
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
            TRY AGAIN
          </button>
        </div>
      </Room>
    );
  }

  const isCorrect = selected === question?.correct_id;

  return (
    <Room>
      <Hearts count={hp} score={score} streak={streak} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        position: 'relative',
      }}>
        {loading && (
          <div style={{ fontSize: 10, animation: 'flicker 0.8s infinite' }}>
            ENTERING ROOM...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 8, color: '#f66', marginBottom: 16 }}>
              Error: {error}
            </p>
            <button
              onClick={() => fetchQuestion()}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: 8,
                padding: '8px 16px',
                background: 'none',
                border: '2px solid #f66',
                color: '#f66',
                cursor: 'pointer',
              }}
            >
              RETRY
            </button>
          </div>
        )}

        {question && !loading && (
          <>
            {/* Type badge */}
            <div style={{
              fontSize: 7,
              color: '#ff0',
              marginBottom: 8,
              letterSpacing: 2,
            }}>
              {question.type?.replace('_', ' ')}
            </div>

            {/* Situation */}
            {question.situation && (
              <div style={{
                fontSize: 8,
                color: '#999',
                marginBottom: 8,
                fontStyle: 'italic',
                textAlign: 'center',
                maxWidth: 400,
              }}>
                {question.situation}
              </div>
            )}

            {/* Question */}
            <div style={{
              fontSize: 10,
              textAlign: 'center',
              marginBottom: 40,
              maxWidth: 500,
              lineHeight: 1.6,
            }}>
              {question.question}
            </div>

            {/* Pedestals */}
            <div style={{
              display: 'flex',
              gap: 48,
              alignItems: 'flex-end',
            }}>
              {question.items?.map((item) => {
                let result = null;
                if (selected !== null) {
                  if (item.id === question.correct_id) result = 'correct';
                  else if (item.id === selected) result = 'wrong';
                }
                const hideLabel = question.type === 'ICON_QUIZ' && selected === null;
                return (
                  <Pedestal
                    key={item.id}
                    item={item}
                    onClick={() => handleAnswer(item.id)}
                    disabled={selected !== null}
                    result={result}
                    hideLabel={hideLabel}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Feedback */}
        {selected !== null && question && (
          <Feedback
            correct={isCorrect}
            explanation={question.explanation}
            onNext={handleNext}
          />
        )}
      </div>
    </Room>
  );
}
