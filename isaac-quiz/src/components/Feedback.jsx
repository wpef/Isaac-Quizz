import React, { useState } from 'react';
import ItemSheet from './ItemSheet.jsx';
import { itemSprite } from '../lib/assets.js';
import { fetchExplanation } from '../lib/explain.js';

export default function Feedback({ question, choiceId, correct, points, items, tags, onNext, nextLabel = 'Salle suivante' }) {
  const heldIds = (question.held || []).filter((id) => !question.pedestals.includes(id));
  const shown = [...question.pedestals, ...heldIds].map((id) => items.get(id)).filter(Boolean);
  const [tab, setTab] = useState(() => {
    if (question.targetId !== undefined && question.targetId !== null && items.has(question.targetId)) return question.targetId;
    return question.answerMode === 'pedestal' ? question.correctId : question.pedestals[0];
  });
  const [ai, setAi] = useState(null); // null | 'loading' | string | 'none'

  async function why() {
    setAi('loading');
    const text = await fetchExplanation(question, choiceId, items);
    setAi(text || 'none');
  }

  const chosenExpl = question.explanations[choiceId];
  const correctExpl = question.explanations[question.correctId];

  return (
    <div className="sheet" role="dialog" aria-live="polite">
      <div className="sheet__head">
        <span className={correct ? 'sheet__verdict--good' : 'sheet__verdict--bad'}>
          {correct ? 'BON CHOIX !' : 'RATÉ'}
        </span>
        <span className="sheet__points">{correct ? `+${points}` : '+0'}</span>
      </div>
      <div className="sheet__body">
        {!correct && chosenExpl && <div className="sheet__expl sheet__expl--bad">{chosenExpl}</div>}
        <div className="sheet__expl sheet__expl--good">{correctExpl}</div>
        {ai === 'loading' && <div className="sheet__expl sheet__ai">…</div>}
        {typeof ai === 'string' && ai !== 'loading' && ai !== 'none' && <div className="sheet__expl sheet__ai">{ai}</div>}
        {ai === 'none' && <div className="toast">Explication contextuelle indisponible (function non configurée).</div>}

        {shown.length > 1 && (
          <div className="tabs">
            {shown.map((it) => {
              const cls = ['tab'];
              if (it.id === tab) cls.push('tab--active');
              if (question.answerMode === 'pedestal') {
                if (it.id === question.correctId) cls.push('tab--correct');
                else if (it.id === choiceId) cls.push('tab--wrong');
              }
              if (heldIds.includes(it.id)) cls.push('tab--held');
              return (
                <button key={it.id} type="button" className={cls.join(' ')} onClick={() => setTab(it.id)}>
                  <img src={itemSprite(it.id)} alt="" draggable={false} />
                  <span>{heldIds.includes(it.id) ? `(build) ${it.name}` : it.name}</span>
                </button>
              );
            })}
          </div>
        )}
        {shown.length > 0 && <ItemSheet item={items.get(tab) || shown[0]} tags={tags} />}
      </div>
      <div className="sheet__actions">
        {ai === null && (
          <button type="button" className="btn btn--ghost" onClick={why}>Pourquoi ?</button>
        )}
        <button type="button" className="btn btn--primary" onClick={onNext} autoFocus>{nextLabel} ›</button>
      </div>
    </div>
  );
}
