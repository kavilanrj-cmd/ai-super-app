// Parsing utilities that turn raw AI markdown into structured, rendered data.
// Every parser falls back gracefully: if structure can't be detected the raw
// text is marked as `extra` and rendered as beautiful Markdown instead.

export function stripInline(s: string): string {
  return (s || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/~{2}/g, '')
    .replace(/\*\s*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BULLET_RE = /^\s*(?:[-*•‣✓✔]|>\s*|(\d+)[.)])\s+(.*)/;

export function splitLines(text: string): string[] {
  return (text || '').split(/\r?\n/).map((l) => l.trim());
}

function isSeparator(line: string): boolean {
  if (!line) return true;
  if (line.length < 2) return false;
  if (/[a-zA-Z0-9\u0900-\u097F]/.test(line)) return false;
  return /^[\s━──═‗-]+$/.test(line);
}

/* ------------------------------------------------------------------ *
 * Roadmap
 * ------------------------------------------------------------------ */

export interface RoadmapPhase {
  index: number;
  title: string;
  weekLabel: string | null;
  weekStart: number | null;
  weekEnd: number | null;
  items: string[];
  description: string;
}

export interface RoadmapParse {
  from: string | null;
  to: string | null;
  phases: RoadmapPhase[];
  extra: string;
}

const ARROW_RE = /(.+?)\s*(?:->|→|➔|➜|⟶|=>|-->|>>)\s*(.+)/;
const VERTICAL_ARROW_RE = /^[\s]*[↓▼v,|.\-=]*$/;
const PHASE_RE = /^(?:#{1,4}\s*)?(?:[\-*•]\s*)?\*{0,2}\s*(?:phase|stage|milestone|step)\s*(?:(\d+))?\s*[:.\-–—)]?\s*(.*)$/i;
const WEEKS_RE = /(?:weeks?|months?)\s*(\d+)\s*[-–—]\s*(\d+)|(?:weeks?|months?)\s*(\d+)\s*to\s*(\d+)|week\s+(\d+)\s*[-–—]\s*week\s+(\d+)/i;

interface PhaseBuffer {
  index: number;
  title: string;
  weekStart: number | null;
  weekEnd: number | null;
  lines: string[];
}

function finalizePhase(buf: PhaseBuffer | null, phaseNum: number): RoadmapPhase | null {
  if (!buf) return null;
  const items: string[] = [];
  const desc: string[] = [];
  let weekStart = buf.weekStart;
  let weekEnd = buf.weekEnd;
  for (const line of buf.lines) {
    const m = BULLET_RE.exec(line);
    if (m) {
      const item = stripInline(m[2]);
      if (item && !/^(weeks?|months?)\b/i.test(item)) items.push(item);
      continue;
    }
    const wm = WEEKS_RE.exec(line);
    if (wm) {
      weekStart = Number(wm[1] ?? wm[3] ?? wm[5]);
      weekEnd = Number(wm[2] ?? wm[4] ?? wm[6]);
      continue;
    }
    const clean = stripInline(line);
    if (clean && !isSeparator(line) && clean.length < 180 && phaseTitleLikely(clean)) {
      desc.push(clean);
    }
  }
  const weekLabel =
    weekStart != null
      ? `Weeks ${weekStart}\u2013${weekEnd ?? weekStart}`
      : null;
  return {
    index: phaseNum,
    title: buf.title,
    weekLabel,
    weekStart,
    weekEnd,
    items,
    description: desc.join(' '),
  };
}

function phaseTitleLikely(s: string): boolean {
  if (PHASE_RE.test(s)) return false;
  if (WEEKS_RE.test(s)) return false;
  if (/^#{1,6}\s/.test(s)) return false;
  return true;
}

export function parseRoadmap(raw: string): RoadmapParse {
  const lines = splitLines(raw);
  const rest: string[] = [];
  const phases: RoadmapPhase[] = [];
  let from: string | null = null;
  let to: string | null = null;
  let cur: PhaseBuffer | null = null;

  // --- arrow / transition detection ---
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const arrow = ARROW_RE.exec(line);
    if (arrow && !PHASE_RE.test(line)) {
      if (!from) {
        from = stripInline(arrow[1]);
        to = stripInline(arrow[2]);
        lines[i] = '';
        continue;
      }
    }
    // vertical variant: "Frontend Developer" / ↓ / "Full Stack"
    if (
      !from &&
      VERTICAL_ARROW_RE.test(line) &&
      i > 0 &&
      i + 1 < lines.length &&
      lines[i - 1] &&
      lines[i + 1]
    ) {
      from = stripInline(lines[i - 1]);
      to = stripInline(lines[i + 1]);
      lines[i - 1] = '';
      lines[i] = '';
      lines[i + 1] = '';
    }
  }

  // --- phase blocks ---
  let phaseNum = 0;
  const flush = () => {
    const p = finalizePhase(cur, cur?.index ?? 0);
    if (p) phases.push(p);
    cur = null;
  };

  for (const line of lines) {
    if (!line || isSeparator(line)) continue;
    const pm = PHASE_RE.exec(line);
    if (pm) {
      flush();
      phaseNum += 1;
      cur = { index: phaseNum, title: stripInline(pm[1] || pm[2] || `Phase ${phaseNum}`), weekStart: null, weekEnd: null, lines: [] };
      continue;
    }
    if (cur) {
      cur.lines.push(line);
    } else {
      rest.push(line);
    }
  }
  flush();

  const extra = rest.join('\n').trim();
  return { from, to, phases, extra };
}

/* ------------------------------------------------------------------ *
 * Interview
 * ------------------------------------------------------------------ */

export interface InterviewQA {
  index: number;
  question: string;
  answer: string;
  tip: string;
}

export interface InterviewParse {
  items: InterviewQA[];
  extra: string;
}

const QA_QUESTION_RE = /^\s*(?:q\.?\s*\d*\s*[):.\-]\s*|\d+\s*[.):]\s*)(.+)$/i;
const QA_ANSWER_RE = /^\s*(?:model\s*answer|answer|a)\s*[:：]\s*(.*)$/i;
const QA_TIP_RE = /^\s*(?:tip|hint|key\s*tip|pro\s*tip)\s*[:：]?\s*(.*)$/i;

export function parseInterview(raw: string): InterviewParse {
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const items: InterviewQA[] = [];
  let cur: InterviewQA | null = null;
  let mode: 'question' | 'answer' | 'tip' = 'question';
  const leftover: string[] = [];
  let started = false;

  const pushItem = () => {
    if (cur && cur.question) items.push(cur);
  };

  for (const line of lines) {
    if (!line) {
      if (mode === 'tip' && cur) mode = 'question';
      continue;
    }
    const qm = QA_QUESTION_RE.exec(line);
    if (qm) {
      pushItem();
      cur = { index: items.length + 1, question: stripInline(qm[1]), answer: '', tip: '' };
      mode = 'question';
      started = true;
      continue;
    }
    if (!cur) {
      leftover.push(line);
      continue;
    }
    const am = QA_ANSWER_RE.exec(line);
    if (am && am[0].length < 200) {
      mode = 'answer';
      cur.answer += (am[1] || '').trim() ? ` ${trimLoose(am[1])}` : '';
      continue;
    }
    const tm = QA_TIP_RE.exec(line);
    if (tm && tm[0].length < 120) {
      mode = 'tip';
      cur.tip += (tm[1] || '').trim() ? ` ${trimLoose(tm[1])}` : '';
      continue;
    }
    if (mode === 'answer') {
      cur.answer += line ? ` ${trimLoose(line)}` : '\n';
    } else if (mode === 'tip') {
      cur.tip += line ? ` ${trimLoose(line)}` : '\n';
    } else {
      leftover.push(line);
    }
  }
  pushItem();

  const clean = (s: string) => stripInline(s.replace(/\s+/g, ' '));
  const structured = items.map((it, i) => ({
    index: i + 1,
    question: clean(it.question),
    answer: clean(it.answer),
    tip: clean(it.tip),
  }));

  if (structured.length >= 2 && started) {
    return { items: structured, extra: leftover.join('\n') };
  }
  return {
    items: [],
    extra: structured.length ? structured.map((s) => `${s.index}. ${s.question}\nAnswer: ${s.answer}\nTip: ${s.tip}`).join('\n\n') + (leftover.length ? `\n\n${leftover.join('\n')}` : '') : raw,
  };
}

function trimLoose(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ *
 * Salary
 * ------------------------------------------------------------------ */

export interface SalaryTier {
  key: 'entry' | 'mid' | 'senior';
  label: string;
  text: string;
  value: number | null;
}

export interface SalaryParse {
  currency: string | null;
  rangeText: string | null;
  rangeMin: number | null;
  rangeMax: number | null;
  tiers: SalaryTier[];
  extra: string;
}

const CURRENCY_INR = /\b(?:inr|₹|lpa|lakh|lacs)\b/i;
const CURRENCY_USD = /\$\b|\b(?:usd|k\b)/i;
const RANGE_RE = /([\d.,]+\s*(?:k|lpa|lakh|lacs|cr|crore)?)\s*[-–—]\s*([\d.,]+\s*(?:k|lpa|lakh|lacs|cr|crore)?)/i;
const RANGE_HINT_RE = /(range|salary|pay|₹|€|£|\$.|\bINR\b|\bLPA\b|\bLakh\b|\bLacs\b)/i;

function numFrom(s: string): number | null {
  const num = parseFloat((s || '').replace(/,/g, ''));
  if (Number.isNaN(num)) return null;
  const lower = s.toLowerCase();
  if (/(lpa|lakh|lacs)/.test(lower)) return num * 100000;
  if (/(cr|crore)/.test(lower)) return num * 10000000;
  if (/k\b/.test(lower)) return num * 1000;
  return num;
}

const TIER_RE = /(?:^|[-•*])\s*(entry\s*level|junior\s*level|mid[\s-]*(?:level)?|senior\s*level)\s*[:：]?\s*(.*)$/i;

export function parseSalary(raw: string): SalaryParse {
  let currency: string | null = null;
  if (CURRENCY_INR.test(raw)) currency = 'INR';
  else if (CURRENCY_USD.test(raw)) currency = 'USD';
  else if (/\€/.test(raw)) currency = 'EUR';
  else if (/\£/.test(raw)) currency = 'GBP';

  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  let rangeText: string | null = null;
  let rangeMin: number | null = null;
  let rangeMax: number | null = null;
  const tiers: SalaryTier[] = [];
  const extra: string[] = [];
  let currentTier: SalaryTier | null = null;

  const flushTier = () => {
    if (currentTier && currentTier.text) tiers.push(currentTier);
    currentTier = null;
  };

  for (const line of lines) {
    if (!line) continue;
    const tm = TIER_RE.exec(line);
    if (tm) {
      flushTier();
      const label = tm[1];
      const key = /^entry|^junior/.test(label.toLowerCase())
        ? 'entry'
        : /^mid/.test(label.toLowerCase())
          ? 'mid'
          : 'senior';
      currentTier = { key, label: label.charAt(0).toUpperCase() + label.slice(1), text: stripInline(tm[2] || ''), value: null };
      continue;
    }
    const rm = RANGE_RE.exec(line);
    if (rm && !rangeText && RANGE_HINT_RE.test(line) && rm[1] !== rm[2]) {
      rangeText = trimLoose(line);
      rangeMin = numFrom(rm[1]);
      rangeMax = numFrom(rm[2]);
      continue;
    }
    if (currentTier) {
      if (/^(factors?|growth|trajectory|what affects|key considerations)/i.test(line)) {
        flushTier();
        extra.push(line);
      } else {
        const clean = stripInline(line);
        if (clean) currentTier.text += (currentTier.text ? ' ' : '') + clean;
      }
      continue;
    }
    extra.push(line);
  }
  flushTier();

  for (const t of tiers) {
    const n = numFrom(t.text);
    t.value = n;
  }

  if (currency === 'INR') {
    for (const t of tiers) {
      if (t.value != null) t.value = Math.round(t.value / 100000) * 100000;
    }
  }

  const finalExtra = extra.join('\n').trim();
  if (tiers.length === 0 && !rangeText) {
    return { currency, rangeText: null, rangeMin: null, rangeMax: null, tiers: [], extra: raw };
  }
  return { currency, rangeText, rangeMin: rangeMin && rangeMin > 0 ? rangeMin : null, rangeMax, tiers, extra: finalExtra };
}

export function formatSalaryNum(n: number | null | undefined, currency: string | null | undefined): string {
  if (n == null) return '';
  const c = currency || '';
  if (c === 'INR') {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`;
  }
  if (n >= 1000) return `${c}${(n / 1000).toFixed(0)}k`;
  return `${c}${n.toFixed(0)}`;
}

/* ------------------------------------------------------------------ *
 * Coding challenge
 * ------------------------------------------------------------------ */

export interface ChallengeParse {
  problem: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string[];
  starterCode: { language: string; code: string } | null;
  extra: string;
}

const FENCE_RE = /```([\w+-]*)\s*\n([\s\S]*?)```/g;
const SECTION_RE = /^(?:#{1,6}\s*)?(?:\*{1,2}\s*)?(problem|example input|example output|constraints|starter code)\s*(?:\*{1,2})?\s*[:：]?\s*$/i;
const INLINE_SECTION_RE = /^(problem|example input|example output|constraints|starter code)\s*[:：]\s*(.*)$/i;

export function parseChallenge(raw: string): ChallengeParse {
  const fences: { lang: string; code: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  FENCE_RE.lastIndex = 0;
  while ((m = FENCE_RE.exec(raw))) {
    fences.push({ lang: m[1] || 'code', code: m[2].replace(/\n$/, ''), index: m.index });
  }
  const withoutFences = raw.replace(FENCE_RE, (mm) => '\u0002'.repeat(mm.length));

  let current: string | null = null;
  const bucket: Record<string, string> = {};
  const lines = withoutFences.split(/\r?\n/).map((l) => l.trim());
  const rest: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    const sm = SECTION_RE.exec(line);
    if (sm) {
      current = sm[1].toLowerCase();
      continue;
    }
    const im = INLINE_SECTION_RE.exec(line);
    if (im) {
      current = im[1].toLowerCase();
      bucket[current] = (bucket[current] || '') + ' ' + (im[2] || '').trim();
      continue;
    }
    if (current) {
      if (line === '\u0002' || line.includes('\u0002')) continue;
      bucket[current] = (bucket[current] || '') + '\n' + line;
      continue;
    }
    // content before any recognized section header
    if (line === '\u0002' || line.includes('\u0002')) continue;
    rest.push(line);
  }

  const section = (name: string) => bucket[name]?.trim() || '';
  const constraints = section('constraints')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && !BULLET_RE.test(l))
    .concat(
      section('constraints')
        .split(/\n+/)
        .map((l) => {
          const bm = BULLET_RE.exec(l);
          return bm ? stripInline(bm[2]) : '';
        })
        .filter(Boolean)
    );

  // Classify code fences using the section they sit in.
  let starterCode: { language: string; code: string } | null = null;
  let exampleInput = section('example input');
  let exampleOutput = section('example output');

  const labelBeforeIndex = (idx: number): string | null => {
    const before = raw.slice(0, idx);
    const last = before.split(/\r?\n/).filter((l) => l.trim()).slice(-3).join('\n').toLowerCase();
    if (/starter code/.test(last)) return 'starter';
    if (/example input/.test(last)) return 'input';
    if (/example output/.test(last)) return 'output';
    return null;
  };

  for (const f of fences) {
    const cls = labelBeforeIndex(f.index);
    if (cls === 'input') exampleInput = exampleInput || f.code;
    else if (cls === 'output') exampleOutput = exampleOutput || f.code;
    else if (cls === 'starter') starterCode = { language: f.lang, code: f.code };
  }
  if (!exampleInput && fences.length > 0 && /example input/i.test(raw)) {
    const idx = raw.toLowerCase().indexOf('example input');
    const f = fences.find((x) => x.index > idx);
    if (f) exampleInput = f.code;
  }
  if (!exampleOutput && fences.length > 0 && /example output/i.test(raw)) {
    const idx = raw.toLowerCase().indexOf('example output');
    const f = fences.find((x) => x.index > idx);
    if (f) exampleOutput = f.code;
  }
  if (!starterCode) {
    const idx = raw.toLowerCase().indexOf('starter code');
    if (idx >= 0) {
      const candidates = fences.filter((x) => x.index > idx);
      if (candidates.length === 1) starterCode = { language: candidates[0].lang, code: candidates[0].code };
      else if (candidates.length > 1) {
        // drop example blocks; pick the last fence
        const last = candidates[candidates.length - 1];
        starterCode = { language: last.lang, code: last.code };
      }
    }
  }

  const problem = section('problem') || (constraints.length ? rest.join('\n').trim() : '');
  const extra = rest.join('\n').trim() || (section('problem') ? '' : raw);
  const cleanedConstraints = Array.from(new Set(constraints.map((c) => stripInline(c)).filter(Boolean)));

  if (problem || starterCode || exampleInput || cleanedConstraints.length) {
    return {
      problem: stripInline(problem),
      exampleInput,
      exampleOutput,
      constraints: cleanedConstraints,
      starterCode,
      extra,
    };
  }
  return { problem: '', exampleInput: '', exampleOutput: '', constraints: [], starterCode: null, extra: raw };
}