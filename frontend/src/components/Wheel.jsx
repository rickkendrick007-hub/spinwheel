import { useMemo } from 'react';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [`M`, x, y, `L`, start.x, start.y, `A`, radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' ');
}

const fallbackPalette = ['#1ea7ff', '#1234ff', '#f5c15b', '#1fd4a7', '#4f75ff', '#0b5ee8', '#1db0f6'];

export default function Wheel({ offers, rotation = 0 }) {
  const segments = useMemo(() => {
    const segmentAngle = 360 / offers.length;
    return offers.map((offer, index) => ({
      ...offer,
      angleStart: index * segmentAngle,
      angleEnd: (index + 1) * segmentAngle,
      angleMiddle: index * segmentAngle + segmentAngle / 2,
      displayColor: offer.color || fallbackPalette[index % fallbackPalette.length]
    }));
  }, [offers]);

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute left-1/2 top-1 z-30 h-0 w-0 -translate-x-1/2 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-gold drop-shadow-[0_0_20px_rgba(245,193,91,.7)]" />
      <div
        className="relative aspect-square rounded-full border border-white/10 bg-slate-950/60 p-3 shadow-[0_0_0_1px_rgba(255,255,255,.08),0_0_60px_rgba(18,52,255,.18)]"
        style={{ transition: 'transform 6.2s cubic-bezier(0.12, 0.8, 0.15, 1)', transform: `rotate(${rotation}deg)` }}
      >
        <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible rounded-full">
          <defs>
            <radialGradient id="wheelGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1b2f57" />
              <stop offset="100%" stopColor="#08111f" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="194" fill="url(#wheelGlow)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          {segments.map((segment, index) => {
            const labelPosition = polarToCartesian(200, 200, 124, segment.angleMiddle);
            return (
              <g key={`${segment.title}-${index}`}>
                <path d={describeArc(200, 200, 188, segment.angleStart, segment.angleEnd)} fill={segment.displayColor} opacity="0.88" />
                <path d={describeArc(200, 200, 188, segment.angleStart, segment.angleEnd)} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="2" />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  fill="#f8fafc"
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${segment.angleMiddle}, ${labelPosition.x}, ${labelPosition.y})`}
                >
                  {segment.title.length > 16 ? `${segment.title.slice(0, 16)}…` : segment.title}
                </text>
              </g>
            );
          })}
          <circle cx="200" cy="200" r="56" fill="#08101f" stroke="#f5c15b" strokeWidth="4" />
          <circle cx="200" cy="200" r="34" fill="#0d1b33" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
          <text x="200" y="200" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="700">
            SPIN
          </text>
        </svg>
      </div>
    </div>
  );
}
