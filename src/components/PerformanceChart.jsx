import React from 'react';

export default function PerformanceChart({ timeline }) {
  if (timeline.length < 2)
    return <p className="chart-empty">A pace graph appears after a longer test.</p>;
  const width = 800,
    height = 180,
    left = 42,
    right = 12,
    top = 14,
    bottom = 28;
  const maxTime = Math.max(timeline.at(-1).time, 1);
  const maxWpm = Math.max(
    20,
    Math.ceil(Math.max(...timeline.map((point) => Math.max(point.wpm, point.rawWpm))) / 20) * 20,
  );
  const x = (time) => left + (time / maxTime) * (width - left - right);
  const y = (wpm) => height - bottom - (wpm / maxWpm) * (height - top - bottom);
  const points = (key) => timeline.map((point) => `${x(point.time)},${y(point[key])}`).join(' ');
  return (
    <div className="performance-chart">
      <div className="chart-heading">
        <span>Your pace</span>
        <span className="chart-legend">
          <span>— wpm</span>
          <span>┄ raw</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Words per minute and raw words per minute over the test"
      >
        {[0, 0.5, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={left}
              y1={y(maxWpm * ratio)}
              x2={width - right}
              y2={y(maxWpm * ratio)}
              className="chart-grid"
            />
            <text x={left - 10} y={y(maxWpm * ratio) + 4} textAnchor="end">
              {Math.round(maxWpm * ratio)}
            </text>
          </g>
        ))}
        <polyline points={points('rawWpm')} className="chart-raw" />
        <polyline points={points('wpm')} className="chart-net" />
        <text x={left} y={height - 4}>
          0s
        </text>
        <text x={width - right} y={height - 4} textAnchor="end">
          {maxTime.toFixed(1)}s
        </text>
        {timeline
          .filter((point) => point.errors > 0)
          .map((point) => (
            <circle
              key={point.time}
              cx={x(point.time)}
              cy={y(point.wpm)}
              r="3"
              className="chart-error"
            >
              <title>
                {point.errors} errors at {point.time.toFixed(1)} seconds
              </title>
            </circle>
          ))}
      </svg>
      <details className="chart-data">
        <summary>View chart data</summary>
        <div className="table-scroll">
          <table>
            <caption>Typing pace by elapsed second</caption>
            <thead>
              <tr>
                <th>Seconds</th>
                <th>WPM</th>
                <th>Raw WPM</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((point) => (
                <tr key={point.time}>
                  <td>{point.time.toFixed(1)}</td>
                  <td>{Math.round(point.wpm)}</td>
                  <td>{Math.round(point.rawWpm)}</td>
                  <td>{point.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
