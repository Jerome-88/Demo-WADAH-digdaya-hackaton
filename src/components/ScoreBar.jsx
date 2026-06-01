import { useEffect, useState } from 'react';

export default function ScoreBar({ score, color = 'indigo', animated = true, height = 'h-3' }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setWidth(score), 100);
      return () => clearTimeout(t);
    } else {
      setWidth(score);
    }
  }, [score, animated]);

  const trackClass = color === 'green'
    ? 'bg-green/10'
    : color === 'amber'
    ? 'bg-amber/10'
    : 'bg-indigo/10';

  const fillClass = color === 'green'
    ? 'bg-gradient-to-r from-green to-teal'
    : color === 'amber'
    ? 'bg-gradient-to-r from-amber to-yellow-400'
    : 'bg-gradient-to-r from-indigo to-purple';

  return (
    <div className={`w-full ${trackClass} rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full ${fillClass} score-bar`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
