import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current, done = new Set() }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const isDone    = done.has(i);
        const isActive  = i === current && !isDone;
        const isPending = i > current && !isDone;

        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm font-inter transition-all ${
                  isDone
                    ? 'bg-green text-white'
                    : isActive
                    ? 'bg-indigo text-white ring-4 ring-indigo/20'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? <Check size={15} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`mt-1.5 text-xs font-inter text-center max-w-[80px] leading-tight ${
                  isDone
                    ? 'text-green font-semibold'
                    : isActive
                    ? 'text-indigo font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mb-6 transition-all ${
                  done.has(i) ? 'bg-green' : i < current ? 'bg-indigo/40' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
