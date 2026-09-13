import React from 'react';
import Pedestal from './Pedestal.jsx';
import { TYPE_LABELS } from '../engine/questions.js';

const KEYS = ['A', 'B', 'C'];

/** Prompt banner + altars + (optionally) text choices. Names hidden until answered. */
export default function Question({ question, items, answered, choiceId, onAnswer }) {
  const shown = question.pedestals.map((id) => items.get(id)).filter(Boolean);
  const pedestalMode = question.answerMode === 'pedestal';

  function stateFor(it) {
    if (!answered) return 'idle';
    if (pedestalMode) {
      if (it.id === question.correctId) return 'correct';
      if (it.id === choiceId) return 'wrong';
      return 'dim';
    }
    return 'idle';
  }

  return (
    <>
      <div className="prompt">
        <span className="prompt__type">{TYPE_LABELS[question.type]}</span>
        {question.prompt}
        {question.situation?.note && !question.prompt.includes(question.situation.floor) && (
          <span className="prompt__situation">{question.situation.floor} — {question.situation.note}</span>
        )}
      </div>
      <div className={`altars${shown.length === 1 ? ' altars--single' : ''}`}>
        {shown.map((it) => (
          <Pedestal
            key={it.id}
            item={it}
            state={stateFor(it)}
            picked={answered && pedestalMode && it.id === choiceId}
            revealed={answered}
            clickable={pedestalMode && !answered}
            onClick={() => onAnswer(it.id)}
          />
        ))}
      </div>
      <div className="spacer" />
      {!pedestalMode && (
        <div className="choices">
          {question.choices.map((c, i) => {
            const cls = ['choice'];
            if (answered) {
              if (c.id === question.correctId) cls.push('choice--correct');
              else if (c.id === choiceId) cls.push('choice--wrong');
              else cls.push('choice--dim');
            }
            return (
              <button key={c.id} type="button" className={cls.join(' ')} disabled={answered} onClick={() => onAnswer(c.id)}>
                <span className="choice__key">{KEYS[i]}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
