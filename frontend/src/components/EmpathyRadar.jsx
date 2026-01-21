import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 text-sm">
        <p className="font-semibold text-white mb-1">{data.dimension}</p>
        <p className="text-teal-400">
          Score: <span className="font-mono font-bold">{(data.value * 100).toFixed(0)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const EmpathyRadar = ({ scores = {} }) => {
  const data = useMemo(() => {
    const dimensions = [
      { key: 'warmth', label: 'Warmth', icon: '🔥' },
      { key: 'validation', label: 'Validation', icon: '✓' },
      { key: 'perspective_taking', label: 'Perspective', icon: '👁' },
      { key: 'supportiveness', label: 'Support', icon: '🤝' },
      { key: 'non_judgmental', label: 'Non-Judgmental', icon: '⚖' },
    ];

    return dimensions.map((dim) => ({
      dimension: dim.label,
      value: scores[dim.key] || 0,
      fullMark: 1,
      icon: dim.icon,
    }));
  }, [scores]);

  const averageScore = useMemo(() => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }, [scores]);

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'text-emerald-400';
    if (score >= 0.4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Moderate';
    return 'Needs Improvement';
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Empathy Analysis</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Safety Score:</span>
          <span className={`text-2xl font-bold font-mono ${getScoreColor(averageScore)}`}>
            {(averageScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Score Label */}
      <div className="text-center mb-2">
        <span className={`text-sm font-medium ${getScoreColor(averageScore)}`}>
          {getScoreLabel(averageScore)}
        </span>
      </div>

      {/* Radar Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="radarFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tickCount={5}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Empathy"
              dataKey="value"
              stroke="url(#radarGradient)"
              fill="url(#radarFillGradient)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#14b8a6',
                stroke: '#0f172a',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#8b5cf6',
                stroke: '#0f172a',
                strokeWidth: 2,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.dimension} className="text-center">
            <div className="text-lg mb-1">{item.icon}</div>
            <div className={`text-sm font-mono font-bold ${getScoreColor(item.value)}`}>
              {(item.value * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500 truncate">{item.dimension}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpathyRadar;
