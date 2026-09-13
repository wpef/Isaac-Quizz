import React from 'react';
import { itemSprite } from '../lib/assets.js';
import { TYPE_LABELS } from '../engine/questions.js';
import { mostMissed } from '../lib/stats.js';

const GROUP_LABELS = {
  stats: 'Stats',
  survival: 'Survie',
  mobility: 'Mobilité',
  utility: 'Utilitaire',
  familiar: 'Familiers',
  tears: 'Tirs',
  effects: 'Effets',
  deals: 'Deals',
  transformation: 'Transformations',
  type: 'Type d’item',
};

function Row({ label, e }) {
  const pct = e.n ? Math.round((100 * e.ok) / e.n) : 0;
  return (
    <>
      <span>{label}</span>
      <span>{e.ok}/{e.n}</span>
      <span className="bar" aria-label={`${pct}%`}><i style={{ width: `${pct}%` }} /></span>
    </>
  );
}

export default function Stats({ stats, items, onHome, onReset }) {
  const accuracy = stats.total ? Math.round((100 * stats.correct) / stats.total) : 0;
  const missed = mostMissed(stats, 8);
  return (
    <div className="screen screen--top">
      <h2 className="title">STATS</h2>
      <div className="big-number">{accuracy}%</div>
      <div className="subtitle">{stats.correct}/{stats.total} réponses · best streak {stats.bestStreak}</div>

      <div className="stats-grid">
        <div className="label">Par type de question</div>
        {Object.keys(TYPE_LABELS).map((t) => stats.types[t] && <Row key={t} label={TYPE_LABELS[t]} e={stats.types[t]} />)}
        <div className="label">Par catégorie</div>
        {Object.keys(GROUP_LABELS).map((g) => stats.groups[g] && <Row key={g} label={GROUP_LABELS[g]} e={stats.groups[g]} />)}
      </div>

      {missed.length > 0 && (
        <>
          <div className="label">Items les plus ratés</div>
          <div className="missed">
            {missed.map((m) => {
              const it = items.get(m.id);
              return it ? (
                <div key={m.id} className="missed__row">
                  <img src={itemSprite(it.id)} alt="" draggable={false} />
                  <div>
                    <div>{it.name}</div>
                    <small>{m.misses} raté{m.misses > 1 ? 's' : ''} sur {m.n}</small>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </>
      )}

      {stats.runs?.length > 0 && (
        <div className="subtitle">
          Dernières runs : {stats.runs.slice(-5).map((r) => `${r.score}`).join(' · ')}
        </div>
      )}

      <div className="menu">
        <button type="button" className="btn btn--primary" onClick={onHome}>Menu</button>
        <button type="button" className="btn btn--ghost" onClick={onReset}>Réinitialiser stats + révision</button>
      </div>
    </div>
  );
}
