// Ports the frontend's already-authored skill map content
// (../../src/data/skillMaps.js) into the backend's PRD-shaped static JSON
// (PRD section 5, app/content/units.json). The frontend is the source of
// truth for curriculum content — re-run this after editing skillMaps.js
// rather than hand-editing units.json.
//
// Usage: node backend/scripts/sync_units_from_frontend.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SKILL_MAPS, SKILLS } from '../../src/data/skillMaps.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../app/content/units.json');

// PRD section 5 only names dg/sm/ve explicitly — extending the same
// convention to the 3 skills it doesn't cover.
const PREFIX = {
  social: 'sm',
  video: 've',
  desain: 'dg',
  ecommerce: 'ec',
  marketing: 'mk',
  ugc: 'ugc',
};

function parseNodeId(nodeId) {
  const quiz = /^(\d+)\.(\d+)$/.exec(nodeId);
  if (quiz) return { unit: Number(quiz[1]), sub: Number(quiz[2]), isCheckpoint: false };
  const cp = /^checkpoint-(\d+)$/.exec(nodeId);
  if (cp) return { unit: Number(cp[1]), sub: null, isCheckpoint: true };
  throw new Error(`Unrecognized node id shape: ${nodeId}`);
}

function toUnitId(prefix, nodeId) {
  const { unit, sub, isCheckpoint } = parseNodeId(nodeId);
  return isCheckpoint ? `${prefix}-${unit}-cp${unit}` : `${prefix}-${unit}-${sub}`;
}

function buildContent(node) {
  const parts = [node.materi.intro, node.materi.points.map(p => `- ${p}`).join('\n')];
  if (node.type === 'quiz') {
    parts.push(`Brief: ${node.briefBody}`);
  } else {
    if (node.instruction) parts.push(`Instruksi: ${node.instruction}`);
    if (node.deadlineText) parts.push(`Deadline: ${node.deadlineText}`);
    if (node.checklist?.length) parts.push(`Checklist:\n${node.checklist.map(c => `- ${c}`).join('\n')}`);
  }
  return parts.filter(Boolean).join('\n\n');
}

function buildQuiz(node) {
  if (node.type !== 'quiz') return [];
  return node.questions.map(q => ({
    question: q.question,
    options: q.options,
    answer: q.correctIndex,
    explanation: q.explanation,
  }));
}

const units = [];

for (const skill of SKILLS) {
  const prefix = PREFIX[skill.id];
  const map = SKILL_MAPS[skill.id];
  if (!prefix || !map) throw new Error(`Missing prefix or map for skill ${skill.id} — add it to PREFIX above.`);

  const nodes = map.nodes;
  nodes.forEach((node, i) => {
    const unitId = toUnitId(prefix, node.id);
    const nextNode = nodes[i + 1];
    const nextUnitId = nextNode ? toUnitId(prefix, nextNode.id) : null;

    units.push({
      unit_id: unitId,
      title: node.title,
      type: node.type === 'checkpoint' ? 'checkpoint' : 'materi',
      content: buildContent(node),
      quiz: buildQuiz(node),
      next_unit_id: nextUnitId,
    });
  });
}

writeFileSync(OUTPUT_PATH, JSON.stringify(units, null, 2) + '\n', 'utf-8');
console.log(`Wrote ${units.length} units to ${OUTPUT_PATH}`);
