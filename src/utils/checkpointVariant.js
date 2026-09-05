import { CHECKPOINT_VARIANTS } from '../data/checkpointVariants';

// Picks which content to show for a checkpoint attempt: 0 = the original,
// hand-authored content in skillMaps.js/reviewFeedback.js; 1..N = one of the
// AI-generated variants (different fictional client/colors/typography, same
// underlying skill test). Skills/checkpoints with no authored variants always
// resolve to 0, so this is a no-op everywhere variants haven't been generated.
export function pickVariantIndex(skillId, checkpointId) {
  const variants = CHECKPOINT_VARIANTS[skillId]?.[checkpointId];
  const count = variants?.length || 0;
  return Math.floor(Math.random() * (count + 1));
}

// Resolves a variant index into the actual content to render. `original` is
// the fallback shape pulled from skillMaps.js — same fields as an AI variant
// (info, instruction, briefBullets, checklist) so callers can treat the
// result uniformly regardless of source.
export function resolveCheckpointBrief(skillId, checkpointId, variantIndex, original) {
  const variants = CHECKPOINT_VARIANTS[skillId]?.[checkpointId];
  const variant = variantIndex > 0 ? variants?.[variantIndex - 1] : null;
  if (!variant) return { source: 'original', ...original };
  return {
    source: 'ai',
    clientName: variant.clientName,
    info: variant.info,
    instruction: variant.instruction,
    briefBullets: variant.briefBullets,
    checklist: variant.checklist,
  };
}

// Same idea, for the reviewer-feedback side (RinaSubmit/RinaCertification).
// `originalFeedback` is a REVIEW_FEEDBACK[skill][checkpointId] entry.
export function resolveCheckpointFeedback(skillId, checkpointId, variantIndex, originalFeedback) {
  const variants = CHECKPOINT_VARIANTS[skillId]?.[checkpointId];
  const variant = variantIndex > 0 ? variants?.[variantIndex - 1] : null;
  return variant ? variant.feedback : originalFeedback;
}
