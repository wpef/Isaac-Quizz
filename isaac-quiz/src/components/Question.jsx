import React from 'react';
import Pedestal from './Pedestal.jsx';
import { TYPE_LABELS } from '../engine/questions.js';

const KEYS = ['A', 'B', 'C'];

/** Prompt banner + altars + (optionally) text choices. Names hidden until answered. */
export default function Question({ question, items, answered, choiceId, onAnswer }) {
  const shown = question.pedestals.map((id) => items.get(id)).filter(Boolean);
  const pedestalMode = question.answerMode === 'pedestal';
  // Text options (skip a deal, a rule, an action) can coexist with clickable pedestals.
  const textChoices = question.choices.filter((c) => !(pedestalMode && c.itemId && question.pedestals.includes(c.itemId)));

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
        {question.context && <span className="prompt__situation">{question.context}</span>}
        {!question.context && question.situation?.note && !question.prompt.includes(question.situation.floor) && (
          <span className="prompt__situation">{question.situation.floor} — {question.situation.note}</span>
        )}
      </div>
      <div className={`altars${shown.length === 1 ? ' altars--single' : ''}${shown.length === 0 ? ' altars--empty' : ''}`}>
        {shown.map((it) => (
          <Pedestal
            key={it.id}
            item={it}
            state={stateFor(it)}
            picked={answered && pedestalMode && it.id === choiceId}
            revealed={answered}
            clickable={pedestalMode && !answered && question.choices.some((c) => c.id === it.id)}
            onClick={() => onAnswer(it.id)}
            price={question.prices ? question.prices[it.id] : undefined}
          />
        ))}
      </div>
      <div className="spacer" />
      {textChoices.length > 0 && (
        <div className="choices">
          {textChoices.map((c, i) => {
            const cls = ['choice'];
            if (answered) {
              if (c.id === question.correctId) cls.push('choice--correct');
              else if (c.id === choiceId) cls.push('choice--wrong');
              else cls.push('choice--dim');
            }
            return (
              <button key={c.id} type="button" className={cls.join(' ')} disabled={answered} onClick={() => onAnswer(c.id)}>
                <span className="choice__key">{KEYS[i] || '·'}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
