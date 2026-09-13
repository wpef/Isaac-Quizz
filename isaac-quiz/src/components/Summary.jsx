import React from 'react';
import { itemSprite } from '../lib/assets.js';
import { TYPE_LABELS } from '../engine/questions.js';

export default function Summary({ run, items, onRestart, onHome }) {
  const missed = run.answers.filter((a) => !a.correct);
  return (
    <div className="screen screen--top">
      <h2 className="title">RUN TERMINÉE</h2>
      <div className="big-number">{run.score} pts</div>
      <div className="subtitle">
        {run.answers.length - missed.length}/{run.answers.length} bonnes réponses · meilleur streak {run.bestStreak}
      </div>
      {missed.length === 0 ? (
        <div className="subtitle">Sans faute. Passe en difficulté supérieure.</div>
      ) : (
        <>
          <div className="label">Items ratés</div>
          <div className="missed">
            {missed.map((a, i) => {
              const target = items.get(a.targetId);
              const picked = a.pickedItemId ? items.get(a.pickedItemId) : null;
              return (
                <div key={i} className="missed__row">
                  {target && <img src={itemSprite(target.id)} alt="" draggable={false} />}
                  <div>
                    <div>{target?.name || a.correctLabel}</div>
                    <small>
                      {TYPE_LABELS[a.type]} · {a.prompt}
                      {picked && picked.id !== target?.id ? ` · tu as pris ${picked.name}` : a.pickedLabel && a.pickedLabel !== target?.name ? ` · tu as répondu ${a.pickedLabel}` : ''}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="menu">
        <button type="button" className="btn btn--primary" onClick={onRestart}>Nouvelle run</button>
        <button type="button" className="btn btn--ghost" onClick={onHome}>Menu</button>
      </div>
    </div>
  );
}
