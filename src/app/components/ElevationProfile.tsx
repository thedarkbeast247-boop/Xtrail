import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ElevationProfileProps {
  data: { distance: number; elevation: number }[];
  color?: string;
}

export function ElevationProfile({ data, color = '#10b981' }: ElevationProfileProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg">
          <p className="text-white text-sm mb-1">
            <span className="text-neutral-400">Distance:</span> {payload[0].payload.distance.toFixed(1)} mi
          </p>
          <p className="text-white text-sm">
            <span className="text-neutral-400">Elevation:</span> {payload[0].payload.elevation.toFixed(0)} ft
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" opacity={0.3} />
        <XAxis
          dataKey="distance"
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          tickFormatter={(value) => `${value.toFixed(1)}mi`}
        />
        <YAxis
          stroke="#737373"
          tick={{ fill: '#a3a3a3', fontSize: 11 }}
          tickFormatter={(value) => `${value}ft`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="elevation"
          stroke={color}
          strokeWidth={2}
          fill="url(#elevationGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
