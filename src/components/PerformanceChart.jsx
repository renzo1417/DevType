import React, { useState, useMemo } from 'react';

export default function PerformanceChart({ timeline = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Fallback dummy data if timeline is very short
  const data = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return [
        { time: 1, wpm: 45, rawWpm: 50, errors: 0 },
        { time: 2, wpm: 58, rawWpm: 62, errors: 1 },
        { time: 3, wpm: 65, rawWpm: 70, errors: 0 },
        { time: 4, wpm: 72, rawWpm: 76, errors: 0 },
        { time: 5, wpm: 75, rawWpm: 80, errors: 0 }
      ];
    }
    return timeline;
  }, [timeline]);

  const width = 760;
  const height = 240;
  const padding = { top: 25, right: 35, bottom: 35, left: 45 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max WPM calculation with buffer
  const maxWpm = useMemo(() => {
    const highest = Math.max(...data.map(d => Math.max(d.wpm || 0, d.rawWpm || 0)), 40);
    return Math.ceil(highest / 20) * 20 + 10;
  }, [data]);

  const maxTime = useMemo(() => {
    return Math.max(...data.map(d => d.time), 5);
  }, [data]);

  // Point mapping helpers
  const getX = (t) => padding.left + (t / maxTime) * chartWidth;
  const getY = (w) => padding.top + chartHeight - (w / maxWpm) * chartHeight;

  // Path generator with smooth bezier curves
  const makeSmoothPath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const wpmPoints = data.map(d => ({ x: getX(d.time), y: getY(d.wpm) }));
  const rawWpmPoints = data.map(d => ({ x: getX(d.time), y: getY(d.rawWpm) }));

  const wpmPath = makeSmoothPath(wpmPoints);
  const rawWpmPath = makeSmoothPath(rawWpmPoints);

  // Area under WPM curve
  const areaPath = wpmPoints.length > 0
    ? `${wpmPath} L ${wpmPoints[wpmPoints.length - 1].x} ${padding.top + chartHeight} L ${wpmPoints[0].x} ${padding.top + chartHeight} Z`
    : '';

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => Math.round(maxWpm * ratio));

  return (
    <div className="perf-chart-container">
      <div className="perf-chart-header">
        <span className="perf-chart-title">WPM & ACCURACY OVER TIME</span>
        <div className="perf-chart-legend">
          <div className="legend-item">
            <span className="legend-line line-wpm" />
            <span>Net WPM</span>
          </div>
          <div className="legend-item">
            <span className="legend-line line-raw" />
            <span>Raw WPM</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-error" />
            <span>Error</span>
          </div>
        </div>
      </div>

      <div className="chart-svg-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="perf-svg"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="wpmAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map(val => {
            const y = getY(val);
            return (
              <g key={`ytick-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#wpmAreaGradient)" />
          )}

          {/* Raw WPM Path */}
          {rawWpmPath && (
            <path
              d={rawWpmPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* Net WPM Path */}
          {wpmPath && (
            <path
              d={wpmPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Error markers */}
          {data.map((d, i) => {
            if (!d.errors || d.errors === 0) return null;
            const x = getX(d.time);
            const y = getY(d.wpm);
            return (
              <g key={`err-${i}`}>
                <circle cx={x} cy={y} r="4" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ✕
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Vertical Line & Overlay */}
          {hoverIndex !== null && data[hoverIndex] && (
            <g>
              <line
                x1={getX(data[hoverIndex].time)}
                y1={padding.top}
                x2={getX(data[hoverIndex].time)}
                y2={padding.top + chartHeight}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(data[hoverIndex].time)}
                cy={getY(data[hoverIndex].wpm)}
                r="5"
                fill="var(--accent)"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Invisible hover trigger columns */}
          {data.map((d, i) => {
            const colWidth = chartWidth / data.length;
            const x = getX(d.time) - colWidth / 2;
            return (
              <rect
                key={`trigger-${i}`}
                x={x}
                y={padding.top}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                style={{ cursor: 'crosshair' }}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(getX(data[hoverIndex].time) / width) * 100}%`,
              top: `${(getY(data[hoverIndex].wpm) / height) * 100 - 15}%`
            }}
          >
            <div className="tooltip-row">
              <span className="tooltip-label">Time:</span>
              <span className="tooltip-val font-mono">{data[hoverIndex].time}s</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label accent-text">WPM:</span>
              <span className="tooltip-val font-mono">{Math.round(data[hoverIndex].wpm)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label text-muted">Raw:</span>
              <span className="tooltip-val font-mono">{Math.round(data[hoverIndex].rawWpm)}</span>
            </div>
            {data[hoverIndex].errors > 0 && (
              <div className="tooltip-row text-error">
                <span className="tooltip-label">Errors:</span>
                <span className="tooltip-val font-mono">{data[hoverIndex].errors}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
