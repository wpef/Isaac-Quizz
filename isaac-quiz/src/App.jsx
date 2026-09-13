import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import itemsData from './data/items.json';
import tags from './data/tags.json';
import synergies from './data/synergies.json';
import scenarios from './data/scenarios.json';
import { createGenerator, DEFAULT_WEIGHTS } from './engine/index.js';
import Room from './components/Room.jsx';
import Hud from './components/Hud.jsx';
import Question from './components/Question.jsx';
import Feedback from './components/Feedback.jsx';
import Title from './components/Title.jsx';
import Summary from './components/Summary.jsx';
import Stats from './components/Stats.jsx';
import { load, save } from './lib/storage.js';
import { loadSrs, recordAnswer, dueItems, makeItemWeight, makeTypeWeights, clearSrs } from './lib/srs.js';
import { loadStats, recordStat, recordRun, clearStats } from './lib/stats.js';

const RUN_LENGTH = 10;
const FORCE_TYPE = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('type') : null;
const items = new Map(itemsData.map((it) => [it.id, it]));
const DEFAULT_HP = { red: 3, max: 3, soul: 0, black: 0 };

function points(streak) {
  return 100 + Math.min(streak, 9) * 25;
}

export default function App() {
  const [screen, setScreen] = useState('title'); // title | play | summary | stats
  const [mode, setMode] = useState('free'); // free | run | review
  const [difficulty, setDifficulty] = useState(() => load('difficulty', 'normal'));
  const [srs, setSrs] = useState(loadSrs);
  const [stats, setStats] = useState(loadStats);
  const [question, setQuestion] = useState(null);
  const [choiceId, setChoiceId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roomKey, setRoomKey] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [run, setRun] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const genRef = useRef(null);

  useEffect(() => save('difficulty', difficulty), [difficulty]);
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dueCount = useMemo(() => dueItems(srs).length, [srs]);

  const buildGenerator = useCallback((m) => {
    const review = m === 'review';
    return createGenerator({
      items: itemsData,
      tags,
      synergies,
      scenarios,
      difficulty,
      seed: Date.now() ^ (Math.random() * 0xffffffff),
      itemWeight: makeItemWeight(srs, { review }),
      weights: review ? makeTypeWeights(srs, DEFAULT_WEIGHTS) : DEFAULT_WEIGHTS,
    });
  }, [difficulty, srs]);

  function start(m) {
    if (m === 'stats') {
      setScreen('stats');
      return;
    }
    setMode(m);
    genRef.current = buildGenerator(m);
    setScore(0);
    setStreak(0);
    setRun(m === 'run' ? { answers: [], score: 0, bestStreak: 0 } : null);
    const q = genRef.current.next(FORCE_TYPE ? { type: FORCE_TYPE } : undefined);
    setQuestion(q);
    setChoiceId(null);
    setShowFeedback(false);
    setRoomKey((k) => k + 1);
    setScreen('play');
  }

  function answer(id) {
    if (choiceId !== null || !question) return;
    const correct = id === question.correctId;
    const gained = correct ? points(streak) : 0;
    const nextStreak = correct ? streak + 1 : 0;
    setChoiceId(id);
    // Let the pickup / glow animation play before the sheet slides up.
    setTimeout(() => setShowFeedback(true), 650);
    setScore((s) => s + gained);
    setStreak(nextStreak);
    setSrs((prev) => recordAnswer(prev, question, id, correct));
    setStats((prev) => recordStat(prev, question, correct, { items, tags, streak: nextStreak }));
    if (mode === 'run') {
      const picked = question.choices.find((c) => c.id === id);
      setRun((r) => ({
        ...r,
        score: r.score + gained,
        bestStreak: Math.max(r.bestStreak, nextStreak),
        answers: [
          ...r.answers,
          {
            type: question.type,
            prompt: question.prompt,
            correct,
            targetId: question.targetId ?? (question.answerMode === 'pedestal' ? question.correctId : question.pedestals[0]),
            correctLabel: question.choices.find((c) => c.id === question.correctId)?.label,
            pickedItemId: picked?.itemId ?? null,
            pickedLabel: picked?.label,
          },
        ],
      }));
    }
  }

  function next() {
    if (mode === 'run' && run && run.answers.length >= RUN_LENGTH) {
      setStats((prev) => recordRun(prev, { score: run.score, correct: run.answers.filter((a) => a.correct).length, total: run.answers.length, date: Date.now(), difficulty }));
      setScreen('summary');
      return;
    }
    // Door transition: slide out, then swap the room.
    setLeaving(true);
    setTimeout(() => {
      const q = genRef.current.next(FORCE_TYPE ? { type: FORCE_TYPE } : undefined);
      setQuestion(q);
      setChoiceId(null);
      setShowFeedback(false);
      setLeaving(false);
      setRoomKey((k) => k + 1);
    }, 200);
  }

  function resetAll() {
    if (!window.confirm('Effacer les stats et la progression de révision ?')) return;
    setStats(clearStats());
    setSrs(clearSrs());
  }

  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  }

  // Keyboard shortcuts (desktop): 1-3 / A-C to answer, Enter / Space for next.
  useEffect(() => {
    if (screen !== 'play' || !question) return undefined;
    const onKey = (e) => {
      if (choiceId === null) {
        const idx = ['1', '2', '3'].indexOf(e.key) >= 0 ? ['1', '2', '3'].indexOf(e.key) : ['a', 'b', 'c'].indexOf(e.key.toLowerCase());
        if (idx >= 0 && question.choices[idx]) answer(question.choices[idx].id);
      } else if (showFeedback && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (screen === 'title') {
    return (
      <Room roomKey="title">
        <Title
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStart={start}
          dueCount={dueCount}
          stats={stats}
          installPrompt={installPrompt}
          onInstall={install}
        />
      </Room>
    );
  }

  if (screen === 'stats') {
    return (
      <Room roomKey="stats">
        <Stats stats={stats} items={items} onHome={() => setScreen('title')} onReset={resetAll} />
      </Room>
    );
  }

  if (screen === 'summary' && run) {
    return (
      <Room roomKey="summary">
        <Summary run={run} items={items} onRestart={() => start('run')} onHome={() => setScreen('title')} />
      </Room>
    );
  }

  if (!question) {
    return (
      <Room roomKey="empty">
        <div className="screen">
          <div className="subtitle">Plus de question disponible pour ce mode.</div>
          <button type="button" className="btn btn--primary" onClick={() => setScreen('title')}>Menu</button>
        </div>
      </Room>
    );
  }

  const answered = choiceId !== null;
  const correct = answered && choiceId === question.correctId;
  const progress = mode === 'run' ? `${Math.min(run.answers.length + (answered ? 0 : 1), RUN_LENGTH)}/${RUN_LENGTH}` : mode === 'review' ? 'RÉVISION' : null;
  const isLast = mode === 'run' && run && run.answers.length >= RUN_LENGTH;

  return (
    <Room roomKey={roomKey} leaving={leaving}>
      <Hud
        hp={question.hp || DEFAULT_HP}
        score={score}
        streak={streak}
        bestStreak={stats.bestStreak}
        floor={question.situation?.floor}
        progress={progress}
        heldItems={(question.held || []).map((id) => items.get(id)).filter(Boolean)}
        difficulty={difficulty}
      />
      <Question question={question} items={items} answered={answered} choiceId={choiceId} onAnswer={answer} />
      {answered && showFeedback && (
        <Feedback
          key={question.key}
          question={question}
          choiceId={choiceId}
          correct={correct}
          points={points(Math.max(0, streak - 1))}
          items={items}
          tags={tags}
          onNext={next}
          nextLabel={isLast ? 'Résumé' : 'Salle suivante'}
        />
      )}
      {!answered && (
        <div style={{ textAlign: 'center', paddingBottom: 6 }}>
          <button type="button" className="btn btn--ghost" style={{ flex: 'none', fontSize: 7, padding: '6px 10px' }} onClick={() => setScreen('title')}>Quitter</button>
        </div>
      )}
    </Room>
  );
}
