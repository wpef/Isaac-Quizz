import React from 'react';

const DIFFS = ['normal', 'hard', 'expert'];

export default function Title({ difficulty, setDifficulty, onStart, dueCount, stats, installPrompt, onInstall }) {
  const accuracy = stats.total ? Math.round((100 * stats.correct) / stats.total) : null;
  return (
    <div className="screen">
      <h1 className="title">
        ISAAC
        <br />
        THEORYCRAFT
        <br />
        TRAINER
        <small>Repentance · {accuracy === null ? 'nouvelle partie' : `${accuracy}% de précision · best streak ${stats.bestStreak}`}</small>
      </h1>
      <p className="subtitle">Une salle, des piédestaux, un choix. Apprends à reconnaître et à évaluer les items comme en run.</p>

      <div className="label">Difficulté</div>
      <div className="segmented" role="radiogroup">
        {DIFFS.map((d) => (
          <button key={d} type="button" className={d === difficulty ? 'active' : ''} onClick={() => setDifficulty(d)} aria-pressed={d === difficulty}>
            {d}
          </button>
        ))}
      </div>

      <div className="menu">
        <button type="button" className="btn btn--primary" onClick={() => onStart('free')}>Entraînement libre</button>
        <button type="button" className="btn" onClick={() => onStart('run')}>Run · 10 questions</button>
        <button type="button" className="btn" onClick={() => onStart('review')}>
          Révision
          {dueCount > 0 && <span className="badge">{dueCount}</span>}
        </button>
        <div className="menu__hint">{dueCount > 0 ? `${dueCount} item${dueCount > 1 ? 's' : ''} à revoir` : 'Les items ratés reviennent ici plus souvent.'}</div>
        <button type="button" className="btn btn--ghost" onClick={() => onStart('stats')}>Stats</button>
        {installPrompt && (
          <button type="button" className="btn btn--ghost" onClick={onInstall}>Installer l’app</button>
        )}
      </div>
    </div>
  );
}
